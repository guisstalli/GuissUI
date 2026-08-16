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

import { ChangeEmailForm } from '../change-email-form';

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
  return render(<ChangeEmailForm currentEmail="actuel@guiss.sn" />, {
    wrapper: createWrapper(),
  });
}

describe('ChangeEmailForm', () => {
  test('shows the current email readonly and the new email field', () => {
    renderForm();

    const current = screen.getByLabelText(/email actuel/i);
    expect(current).toHaveValue('actuel@guiss.sn');
    expect(current).toBeDisabled();
    expect(screen.getByLabelText(/nouvel email/i)).toBeInTheDocument();
  });

  test('shows a validation error for an invalid email', async () => {
    const user = userEvent.setup();
    renderForm();

    // 'sans@tld' passe la validation HTML native (sinon jsdom bloque le
    // submit avant React Hook Form) mais échoue la validation Zod .email().
    await user.type(screen.getByLabelText(/nouvel email/i), 'sans@tld');
    await user.click(screen.getByRole('button', { name: /envoyer le code/i }));

    expect(await screen.findByText(/email invalide/i)).toBeInTheDocument();
  });

  test('moves to the OTP step after a successful request', async () => {
    server.use(
      http.post(`${env.API_URL}/users/email/change/request/`, () =>
        HttpResponse.json({ detail: 'OTP sent.' }),
      ),
    );

    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/nouvel email/i), 'nouveau@guiss.sn');
    await user.click(screen.getByRole('button', { name: /envoyer le code/i }));

    await screen.findByLabelText(/code de vérification/i);
    expect(screen.getByText(/nouveau@guiss\.sn/)).toBeInTheDocument();
  });

  test('rejects an OTP not matching the "123 456" format', async () => {
    server.use(
      http.post(`${env.API_URL}/users/email/change/request/`, () =>
        HttpResponse.json({ detail: 'OTP sent.' }),
      ),
    );

    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/nouvel email/i), 'nouveau@guiss.sn');
    await user.click(screen.getByRole('button', { name: /envoyer le code/i }));

    await user.type(
      await screen.findByLabelText(/code de vérification/i),
      '123456',
    );
    await user.click(
      screen.getByRole('button', { name: /confirmer le changement/i }),
    );

    expect(await screen.findByText(/format requis/i)).toBeInTheDocument();
  });

  test('confirms the change with a valid OTP and returns to step one', async () => {
    let confirmBody: unknown;
    server.use(
      http.post(`${env.API_URL}/users/email/change/request/`, () =>
        HttpResponse.json({ detail: 'OTP sent.' }),
      ),
      http.post(
        `${env.API_URL}/users/email/change/confirm/`,
        async ({ request }) => {
          confirmBody = await request.json();
          return HttpResponse.json({ detail: 'Email changed.' });
        },
      ),
    );

    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/nouvel email/i), 'nouveau@guiss.sn');
    await user.click(screen.getByRole('button', { name: /envoyer le code/i }));

    await user.type(
      await screen.findByLabelText(/code de vérification/i),
      '123 456',
    );
    await user.click(
      screen.getByRole('button', { name: /confirmer le changement/i }),
    );

    await waitFor(() => {
      expect(confirmBody).toEqual({ otp: '123 456' });
    });
    // Retour à l'étape 1 après confirmation
    await screen.findByLabelText(/nouvel email/i);
  });

  test('the back button returns to the request step without calling the API', async () => {
    server.use(
      http.post(`${env.API_URL}/users/email/change/request/`, () =>
        HttpResponse.json({ detail: 'OTP sent.' }),
      ),
    );

    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/nouvel email/i), 'nouveau@guiss.sn');
    await user.click(screen.getByRole('button', { name: /envoyer le code/i }));

    await screen.findByLabelText(/code de vérification/i);
    await user.click(screen.getByRole('button', { name: /retour/i }));

    expect(await screen.findByLabelText(/nouvel email/i)).toBeInTheDocument();
  });
});
