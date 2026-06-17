import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { describe, expect, test, vi } from 'vitest';

import { env } from '@/config/env';
import { server } from '@/testing/mocks/server';
import { mockClinicSettings } from '@/testing/mocks/handlers/clinic';
import { rtlRender, screen, waitFor } from '@/testing/test-utils';

import { ClinicSettingsForm } from '../clinic-settings-form';

vi.mock('next-auth/react', async () => {
  const actual =
    await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return {
    ...actual,
    getSession: vi.fn().mockResolvedValue(null),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
});

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderForm() {
  const queryClient = createQueryClient();
  return rtlRender(
    <QueryClientProvider client={queryClient}>
      <ClinicSettingsForm settings={mockClinicSettings} />
    </QueryClientProvider>,
  );
}

describe('ClinicSettingsForm', () => {
  test('affiche le nom de la clinique pré-rempli dans le champ', () => {
    // Arrange & Act
    renderForm();

    // Assert
    const input = screen.getByRole('textbox', { name: /nom de la clinique/i });
    expect(input).toHaveValue('Clinique Guiss-Talli');
  });

  test('affiche le bouton Enregistrer', () => {
    // Arrange & Act
    renderForm();

    // Assert
    expect(
      screen.getByRole('button', { name: /enregistrer/i }),
    ).toBeInTheDocument();
  });

  test('affiche les champs Téléphone, Email et Site web', () => {
    // Arrange & Act
    renderForm();

    // Assert
    expect(
      screen.getByRole('textbox', { name: /téléphone/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: /email/i })).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: /site web/i }),
    ).toBeInTheDocument();
  });

  test('affiche la valeur du téléphone pré-remplie', () => {
    // Arrange & Act
    renderForm();

    // Assert
    const phoneInput = screen.getByRole('textbox', { name: /téléphone/i });
    expect(phoneInput).toHaveValue('+221 33 951 00 00');
  });

  test('le bouton Enregistrer est accessible par soumission', async () => {
    // Arrange
    const { userEvent } = await import('@testing-library/user-event');
    const user = userEvent.setup();

    server.use(
      http.patch(
        `${env.API_URL}/clinic/settings/update/`,
        () => HttpResponse.json({ ...mockClinicSettings }),
      ),
    );

    renderForm();

    // Act
    const button = screen.getByRole('button', { name: /enregistrer/i });
    await user.click(button);

    // Assert — bouton toujours présent après clic (no navigation)
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /enregistrer/i }),
      ).toBeInTheDocument();
    });
  });

  test('affiche le champ N° établissement', () => {
    // Arrange & Act
    renderForm();

    // Assert
    expect(
      screen.getByRole('textbox', { name: /n° établissement/i }),
    ).toBeInTheDocument();
  });
});
