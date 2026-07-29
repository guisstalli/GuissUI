import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { describe, expect, test } from 'vitest';

import { env } from '@/config/env';
import {
  administrationHandlers,
  mockAdminDashboard,
} from '@/testing/mocks/handlers/administration';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils';

import { AdminDashboard } from '../admin-dashboard';

// =============================================================================
// Helpers
// =============================================================================

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderDashboard() {
  return rtlRender(
    <QueryClientProvider client={createQueryClient()}>
      <AdminDashboard />
    </QueryClientProvider>,
  );
}

// =============================================================================
// Tests
// =============================================================================

describe('AdminDashboard', () => {
  test('met les indicateurs de flux en tête, avec leur comparateur', async () => {
    server.use(...administrationHandlers);

    renderDashboard();

    await screen.findByText('Examens réalisés');
    expect(screen.getByText('Exécutions IA')).toBeInTheDocument();
    expect(screen.getByText('Incidents de sécurité (7 j)')).toBeInTheDocument();
    expect(screen.getByText('Nouveaux comptes (30 j)')).toBeInTheDocument();
  });

  test('chiffre la variation par rapport à la période précédente', async () => {
    server.use(...administrationHandlers);

    renderDashboard();

    // examens : 64 sur la fenêtre contre 50 avant → +28 %
    await screen.findByText('64');
    expect(screen.getByText('+28 %')).toBeInTheDocument();
    // le point de comparaison est affiché, pas seulement le pourcentage
    expect(screen.getAllByText(/vs 14 j préc\./).length).toBeGreaterThan(0);
  });

  test('une baisse des incidents de sécurité se lit comme une amélioration', async () => {
    server.use(...administrationHandlers);

    renderDashboard();

    // incidents : 4 contre 9 → −56 %, affiché en vert (higherIsBetter=false)
    const variation = await screen.findByText('−56 %');
    expect(variation.className).toMatch(/emerald/);
  });

  test('affiche les libellés français des événements, jamais les clés techniques', async () => {
    server.use(...administrationHandlers);

    renderDashboard();

    await screen.findByText('Échec de connexion');
    expect(screen.getByText('Accès refusé (403)')).toBeInTheDocument();
    expect(screen.queryByText('LOGIN_FAILED')).not.toBeInTheDocument();
    expect(screen.queryByText('ACCESS_DENIED')).not.toBeInTheDocument();
  });

  test('exprime les comptes actifs et vérifiés en proportion du total', async () => {
    server.use(...administrationHandlers);

    renderDashboard();

    await screen.findByText('État des comptes');
    expect(screen.getByText('42 comptes au total')).toBeInTheDocument();
    // 35/42 = 83 %, 38/42 = 90 %
    expect(screen.getByText('83 %')).toBeInTheDocument();
    expect(screen.getByText('90 %')).toBeInTheDocument();
  });

  test('rend la volumétrie système', async () => {
    server.use(...administrationHandlers);

    renderDashboard();

    await screen.findByText('Patients');
    expect(screen.getByText('Conducteurs')).toBeInTheDocument();
    expect(screen.getByText('Rapports IA')).toBeInTheDocument();
  });

  test('affiche la fenêtre issue du payload', async () => {
    server.use(...administrationHandlers);

    renderDashboard();

    await screen.findByText(/14 derniers jours/i);
  });

  test('les boutons de fenêtre sont rendus', async () => {
    server.use(...administrationHandlers);

    renderDashboard();

    await screen.findByText('Examens réalisés');

    expect(screen.getByRole('button', { name: /7 j/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /14 j/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /30 j/i })).toBeInTheDocument();
  });

  test('14 j est la fenêtre active par défaut', async () => {
    server.use(...administrationHandlers);

    renderDashboard();

    await screen.findByText('Examens réalisés');

    expect(screen.getByRole('button', { name: /14 j/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: /7 j/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('changer de fenêtre relance la requête avec le nouveau paramètre', async () => {
    const user = userEvent.setup();

    let capturedDays: string | null = null;
    server.use(
      http.get(`${env.API_URL}/analytics/admin-dashboard/`, ({ request }) => {
        const url = new URL(request.url);
        capturedDays = url.searchParams.get('days');
        return HttpResponse.json({ ...mockAdminDashboard, window_days: 7 });
      }),
    );

    renderDashboard();

    await screen.findByText(/derniers jours/i);

    await user.click(screen.getByRole('button', { name: /7 j/i }));

    await waitFor(() => {
      expect(capturedDays).toBe('7');
    });
  });

  test("affiche un état d'erreur quand l'API renvoie un 500", async () => {
    server.use(
      http.get(`${env.API_URL}/analytics/admin-dashboard/`, () =>
        HttpResponse.json({ detail: 'Server error' }, { status: 500 }),
      ),
    );

    renderDashboard();

    await screen.findByText(/impossible de charger le tableau de bord/i);
    expect(
      screen.getByRole('button', { name: /réessayer/i }),
    ).toBeInTheDocument();
  });
});
