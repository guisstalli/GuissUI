import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, test, vi } from 'vitest';

import { env } from '@/config/env';
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

import { ChangePasswordForm } from '../change-password-form';

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
  return render(<ChangePasswordForm />, { wrapper: createWrapper() });
}

// NOTE: les inputs de ce formulaire sont enveloppés dans un <div> sous
// FormControl, donc le htmlFor du label pointe sur le div — les requêtes
// passent par les placeholders (défaut d'accessibilité à corriger un jour).
const currentField = () => screen.getByPlaceholderText(/mot de passe actuel/i);
const newField = () => screen.getByPlaceholderText(/minimum 8 caractères/i);
const confirmField = () =>
  screen.getByPlaceholderText(/répéter le nouveau mot de passe/i);

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
  {
    current = 'AncienMdp1!',
    next = 'NouveauMdp1!',
    confirm = 'NouveauMdp1!',
  } = {},
) {
  await user.type(currentField(), current);
  await user.type(newField(), next);
  await user.type(confirmField(), confirm);
}

describe('ChangePasswordForm', () => {
  test('renders the three password fields and the submit button', () => {
    renderForm();

    expect(currentField()).toBeInTheDocument();
    expect(newField()).toBeInTheDocument();
    expect(confirmField()).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /modifier le mot de passe/i }),
    ).toBeInTheDocument();
  });

  test('shows a validation error when the new password is too short', async () => {
    const user = userEvent.setup();
    renderForm();

    await fillForm(user, { next: 'court', confirm: 'court' });
    await user.click(
      screen.getByRole('button', { name: /modifier le mot de passe/i }),
    );

    expect(
      await screen.findByText(/minimum 8 caractères/i, { selector: 'p' }),
    ).toBeInTheDocument();
  });

  test('shows a validation error when passwords do not match', async () => {
    const user = userEvent.setup();
    renderForm();

    await fillForm(user, { confirm: 'AutreMdp1!' });
    await user.click(
      screen.getByRole('button', { name: /modifier le mot de passe/i }),
    );

    expect(
      await screen.findByText(/ne correspondent pas/i),
    ).toBeInTheDocument();
  });

  test('does not call the API when validation fails', async () => {
    const apiSpy = vi.fn();
    server.use(
      http.post(`${env.API_URL}/users/password/change/`, () => {
        apiSpy();
        return HttpResponse.json({ detail: 'ok' });
      }),
    );

    const user = userEvent.setup();
    renderForm();

    await user.click(
      screen.getByRole('button', { name: /modifier le mot de passe/i }),
    );

    await screen.findByText(/requis/i);
    expect(apiSpy).not.toHaveBeenCalled();
  });

  test('submits current and new password (never the confirmation) on success', async () => {
    let receivedBody: unknown;
    server.use(
      http.post(
        `${env.API_URL}/users/password/change/`,
        async ({ request }) => {
          receivedBody = await request.json();
          return HttpResponse.json({ detail: 'Password changed.' });
        },
      ),
    );

    const user = userEvent.setup();
    renderForm();

    await fillForm(user);
    await user.click(
      screen.getByRole('button', { name: /modifier le mot de passe/i }),
    );

    await waitFor(() => {
      expect(receivedBody).toEqual({
        current_password: 'AncienMdp1!',
        new_password: 'NouveauMdp1!',
      });
    });
  });

  test('toggles password visibility with the eye button', async () => {
    const user = userEvent.setup();
    renderForm();

    const currentInput = currentField();
    expect(currentInput).toHaveAttribute('type', 'password');

    await user.click(screen.getAllByRole('button', { name: /afficher/i })[0]);
    expect(currentInput).toHaveAttribute('type', 'text');
  });
});
