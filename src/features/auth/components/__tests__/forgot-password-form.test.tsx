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

import { ForgotPasswordForm } from '../forgot-password-form';

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
  return render(<ForgotPasswordForm />, { wrapper: createWrapper() });
}

describe('ForgotPasswordForm', () => {
  test('renders the email field and submit button', () => {
    renderForm();

    expect(screen.getByLabelText(/adresse e-mail/i)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /envoyer le lien/i }),
    ).toBeInTheDocument();
  });

  test('shows a validation error when the email is invalid', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/adresse e-mail/i), 'not-an-email');
    await user.click(screen.getByRole('button', { name: /envoyer le lien/i }));

    await screen.findByRole('alert');
    expect(screen.getByRole('alert')).toHaveTextContent(
      /adresse e-mail invalide/i,
    );
  });

  test('shows a validation error when no email is entered', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.click(screen.getByRole('button', { name: /envoyer le lien/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toBeInTheDocument();
  });

  test('displays success message after a successful submission', async () => {
    server.use(
      http.post('http://localhost:8000/users/password/reset/request/', () =>
        HttpResponse.json({ detail: 'Email sent.' }),
      ),
    );

    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/adresse e-mail/i), 'user@guiss.sn');
    await user.click(screen.getByRole('button', { name: /envoyer le lien/i }));

    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent(/si un compte est associé/i);
  });

  test('shows a "back to login" link after successful submission', async () => {
    server.use(
      http.post('http://localhost:8000/users/password/reset/request/', () =>
        HttpResponse.json({ detail: 'Email sent.' }),
      ),
    );

    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/adresse e-mail/i), 'user@guiss.sn');
    await user.click(screen.getByRole('button', { name: /envoyer le lien/i }));

    await screen.findByRole('status');
    expect(
      screen.getByRole('link', { name: /retour à la connexion/i }),
    ).toBeInTheDocument();
  });

  test('displays a server error when the API returns a 500', async () => {
    server.use(
      http.post('http://localhost:8000/users/password/reset/request/', () =>
        HttpResponse.json({ detail: 'Une erreur interne.' }, { status: 500 }),
      ),
    );

    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/adresse e-mail/i), 'user@guiss.sn');
    await user.click(screen.getByRole('button', { name: /envoyer le lien/i }));

    await waitFor(() => {
      const alerts = screen.getAllByRole('alert');
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  test('disables the submit button while the request is pending', async () => {
    let resolveRequest!: (r: Response) => void;
    server.use(
      http.post(
        'http://localhost:8000/users/password/reset/request/',
        () =>
          new Promise<Response>((resolve) => {
            resolveRequest = resolve;
          }),
      ),
    );

    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/adresse e-mail/i), 'user@guiss.sn');
    await user.click(screen.getByRole('button', { name: /envoyer le lien/i }));

    await waitFor(() => {
      const btn = screen.getByRole('button', { name: /envoi…/i });
      expect(btn).toBeDisabled();
    });

    resolveRequest(HttpResponse.json({ detail: 'ok' }) as unknown as Response);
  });
});
