import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { SessionProvider } from 'next-auth/react';
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

/**
 * L'application enveloppe TOUT dans `SessionProvider` (voir `app/provider.tsx`).
 * Le harnais ne montait que `QueryClientProvider` : un composant lisant la
 * session — pour masquer un lien que le rôle courant ne peut pas suivre —
 * échouait ici alors qu'il fonctionne en production. C'était le harnais qui
 * n'était pas représentatif, pas le composant.
 *
 * Session ADMIN : c'est le destinataire de ce tableau de bord.
 */
const SESSION_ADMIN = {
  user: {
    id: '1',
    name: 'admin@guiss.sn',
    email: 'admin@guiss.sn',
    role: 'ADMIN',
  },
  expires: '2999-01-01T00:00:00.000Z',
};

/** SUPERUSER : porte `exams:view`, donc peut suivre les liens cliniques. */
const SESSION_SUPERUSER = {
  ...SESSION_ADMIN,
  user: { ...SESSION_ADMIN.user, role: 'SUPERUSER' },
};

function renderDashboard(session: typeof SESSION_ADMIN = SESSION_ADMIN) {
  return rtlRender(
    <SessionProvider session={session}>
      <QueryClientProvider client={createQueryClient()}>
        <AdminDashboard />
      </QueryClientProvider>
    </SessionProvider>,
  );
}

// =============================================================================
// Tests
// =============================================================================

describe('AdminDashboard', () => {
  test('ouvre sur le travail en souffrance, pas sur un volume', async () => {
    server.use(...administrationHandlers);

    renderDashboard();

    // 18 examens adultes : technique faite, clinique à saisir. Le chiffre
    // apparaît deux fois (héro + légende de la barre), d'où getAllByText.
    await screen.findByText('En attente de lecture');
    expect(screen.getAllByText('18').length).toBeGreaterThan(0);
  });

  test('propose d agir sur le retard a qui peut ouvrir les examens', async () => {
    server.use(...administrationHandlers);

    renderDashboard(SESSION_SUPERUSER);

    await screen.findByText('En attente de lecture');
    expect(
      screen.getByRole('link', { name: /voir les examens/i }),
    ).toBeInTheDocument();
  });

  test('ne propose pas un lien que l administrateur ne peut pas suivre', async () => {
    // REGRESSION : ADMIN n'a pas `exams:view` et le routage le renvoie vers
    // /administration. Le lien figurait pourtant sur SA page d'accueil —
    // cliquer ne faisait rien. Un appel à l'action mort, constaté en
    // préproduction.
    server.use(...administrationHandlers);

    renderDashboard(SESSION_ADMIN);

    await screen.findByText('En attente de lecture');
    expect(
      screen.queryByRole('link', { name: /voir les examens/i }),
    ).not.toBeInTheDocument();
  });

  test('ne fusionne jamais examens adultes et enfants', async () => {
    server.use(...administrationHandlers);

    renderDashboard();

    // Complétion dérivée chez l'adulte, déclarée chez l'enfant : deux barres.
    await screen.findByText('Examens adultes');
    expect(screen.getByText('Examens enfants')).toBeInTheDocument();
    expect(screen.getByText('Attente clinique')).toBeInTheDocument();
  });

  test('affiche le taux de présence avec ce qui le compose', async () => {
    server.use(...administrationHandlers);

    renderDashboard();

    await screen.findByText('Présence aux rendez-vous');
    expect(screen.getByText('87.5 %')).toBeInTheDocument();
    // Un taux sans son dénominateur n'est pas interprétable.
    expect(screen.getByText('35 honorés · 5 manqués')).toBeInTheDocument();
  });

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
