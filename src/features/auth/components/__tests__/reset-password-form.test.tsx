import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, test, vi } from 'vitest';

import { server } from '@/testing/mocks/server';

// Suppress next-auth telemetry fetch that causes URLSearchParams errors in jsdom
vi.mock('next-auth/react', async () => {
  const actual =
    await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return {
    ...actual,
    getSession: vi.fn().mockResolvedValue(null),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
});

// next/navigation is already mocked globally in setup-tests.ts with:
//   useRouter: () => ({ push: vi.fn(), replace: vi.fn() })
//   useSearchParams: () => ({ get: vi.fn() })
// We override useSearchParams per-describe to control the token value.
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation');
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
    usePathname: () => '/auth/reset-password',
    // Default: provide a valid token
    useSearchParams: () => ({
      get: (key: string) => (key === 'token' ? 'valid-token-abc' : null),
    }),
  };
});

import { ResetPasswordForm } from '../reset-password-form';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function renderForm() {
  return render(<ResetPasswordForm />, { wrapper: createWrapper() });
}

describe('ResetPasswordForm — with valid token', () => {
  test('renders the password fields and submit button when a token is present', () => {
    renderForm();

    expect(screen.getByLabelText(/nouveau mot de passe/i)).toBeInTheDocument();
    expect(
      screen.getByLabelText(/confirmer le mot de passe/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /réinitialiser le mot de passe/i }),
    ).toBeInTheDocument();
  });

  test('shows a validation error when the new password is too short', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/nouveau mot de passe/i), 'short');
    await user.type(
      screen.getByLabelText(/confirmer le mot de passe/i),
      'short',
    );
    await user.click(
      screen.getByRole('button', { name: /réinitialiser le mot de passe/i }),
    );

    expect(
      await screen.findByText(/au moins 8 caractères/i),
    ).toBeInTheDocument();
  });

  test('shows a validation error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(
      screen.getByLabelText(/nouveau mot de passe/i),
      'Secure@123',
    );
    await user.type(
      screen.getByLabelText(/confirmer le mot de passe/i),
      'Different@999',
    );
    await user.click(
      screen.getByRole('button', { name: /réinitialiser le mot de passe/i }),
    );

    expect(
      await screen.findByText(/ne correspondent pas/i),
    ).toBeInTheDocument();
  });

  test('sends token and new_password to the confirm endpoint', async () => {
    let capturedBody: Record<string, unknown> | null = null;
    server.use(
      http.post(
        'http://localhost:8000/users/password/reset/confirm/',
        async ({ request }) => {
          capturedBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ detail: 'Password reset successful.' });
        },
      ),
    );

    const user = userEvent.setup();
    renderForm();

    await user.type(
      screen.getByLabelText(/nouveau mot de passe/i),
      'Secure@123',
    );
    await user.type(
      screen.getByLabelText(/confirmer le mot de passe/i),
      'Secure@123',
    );
    await user.click(
      screen.getByRole('button', { name: /réinitialiser le mot de passe/i }),
    );

    await waitFor(() => {
      expect(capturedBody).not.toBeNull();
    });

    const body = capturedBody as {
      token?: string;
      new_password?: string;
    } | null;
    expect(body?.token).toBe('valid-token-abc');
    expect(body?.new_password).toBe('Secure@123');
  });

  test('displays a server error alert when the API returns 400', async () => {
    server.use(
      http.post('http://localhost:8000/users/password/reset/confirm/', () =>
        HttpResponse.json(
          { detail: 'Token invalide ou expiré.' },
          { status: 400 },
        ),
      ),
    );

    const user = userEvent.setup();
    renderForm();

    await user.type(
      screen.getByLabelText(/nouveau mot de passe/i),
      'Secure@123',
    );
    await user.type(
      screen.getByLabelText(/confirmer le mot de passe/i),
      'Secure@123',
    );
    await user.click(
      screen.getByRole('button', { name: /réinitialiser le mot de passe/i }),
    );

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  test('toggles password field visibility when clicking the eye button', async () => {
    const user = userEvent.setup();
    renderForm();

    const passwordInput = screen.getByLabelText(/nouveau mot de passe/i);
    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(
      screen.getByRole('button', { name: /afficher le mot de passe/i }),
    );
    expect(passwordInput).toHaveAttribute('type', 'text');

    await user.click(
      screen.getByRole('button', { name: /masquer le mot de passe/i }),
    );
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  test('disables the submit button while the request is pending', async () => {
    let resolveRequest!: (r: Response) => void;
    server.use(
      http.post(
        'http://localhost:8000/users/password/reset/confirm/',
        () =>
          new Promise<Response>((resolve) => {
            resolveRequest = resolve;
          }),
      ),
    );

    const user = userEvent.setup();
    renderForm();

    await user.type(
      screen.getByLabelText(/nouveau mot de passe/i),
      'Secure@123',
    );
    await user.type(
      screen.getByLabelText(/confirmer le mot de passe/i),
      'Secure@123',
    );
    await user.click(
      screen.getByRole('button', { name: /réinitialiser le mot de passe/i }),
    );

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /réinitialisation…/i });
      expect(btn).toBeDisabled();
    });

    resolveRequest(HttpResponse.json({ detail: 'ok' }) as unknown as Response);
  });
});
