import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { describe, expect, test } from 'vitest';

import { env } from '@/config/env';
import { PanneauNettoyage } from '@/features/qualite/components/panneau-nettoyage';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils';

const rendre = () =>
  rtlRender(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
          },
        })
      }
    >
      <PanneauNettoyage />
    </QueryClientProvider>,
  );

const plan = (partiel: Record<string, unknown> = {}) => ({
  jour: '2026-08-23',
  examens_concernes: 114,
  patients: 82,
  reprises_epargnees: 0,
  fusions: 25,
  supprimes: 32,
  conflits: 24,
  simulation: true,
  rapport: '',
  ...partiel,
});

/**
 * L'écran signalait quinze doublons et laissait l'utilisateur devant une ligne
 * de commande. Ces tests protègent les deux temps : on annonce, puis on écrit.
 */
describe('Panneau de nettoyage', () => {
  test('la simulation annonce ce qui sera supprimé, sans rien écrire', async () => {
    let applique = false;
    server.use(
      http.post(`${env.API_URL}/analytics/qualite/nettoyage/simulation/`, () =>
        HttpResponse.json(plan()),
      ),
      http.post(`${env.API_URL}/analytics/qualite/nettoyage/`, () => {
        applique = true;
        return HttpResponse.json({}, { status: 201 });
      }),
    );

    const user = userEvent.setup({ pointerEventsCheck: 0 });
    rendre();
    await user.click(screen.getByText('Analyser cette journée'));

    expect(await screen.findByText('Ce qui sera fait')).toBeVisible();
    expect(screen.getByText('32')).toBeVisible();
    expect(applique).toBe(false);
  });

  test('appliquer n’est proposé qu’après la simulation', async () => {
    server.use(
      http.post(`${env.API_URL}/analytics/qualite/nettoyage/simulation/`, () =>
        HttpResponse.json(plan()),
      ),
    );
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    rendre();

    // Confirmer une suppression sans en connaître la portée n'est pas confirmer.
    expect(
      screen.queryByText('Appliquer le nettoyage'),
    ).not.toBeInTheDocument();

    await user.click(screen.getByText('Analyser cette journée'));
    expect(await screen.findByText('Appliquer le nettoyage')).toBeVisible();
  });

  test('une journée saine le dit au lieu de proposer un nettoyage', async () => {
    server.use(
      http.post(`${env.API_URL}/analytics/qualite/nettoyage/simulation/`, () =>
        HttpResponse.json(
          plan({ supprimes: 0, fusions: 0, conflits: 0, examens_concernes: 6 }),
        ),
      ),
    );
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    rendre();
    await user.click(screen.getByText('Analyser cette journée'));

    expect(await screen.findByText(/Rien à nettoyer ce jour-là/)).toBeVisible();
    expect(
      screen.queryByText('Appliquer le nettoyage'),
    ).not.toBeInTheDocument();
  });

  test('appliquer transmet la journée simulée', async () => {
    let recu: unknown = null;
    server.use(
      http.post(`${env.API_URL}/analytics/qualite/nettoyage/simulation/`, () =>
        HttpResponse.json(plan()),
      ),
      http.post(
        `${env.API_URL}/analytics/qualite/nettoyage/`,
        async ({ request }) => {
          recu = await request.json();
          return HttpResponse.json(
            {
              id: 1,
              fusions: 25,
              supprimes: 32,
              arbitrages_crees: 24,
            },
            { status: 201 },
          );
        },
      ),
    );

    const user = userEvent.setup({ pointerEventsCheck: 0 });
    rendre();
    await user.click(screen.getByText('Analyser cette journée'));
    await user.click(await screen.findByText('Appliquer le nettoyage'));

    await waitFor(() =>
      expect(recu).toEqual({
        jour: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
        operation: 'doublons',
      }),
    );
  });
});

/**
 * La campagne scolaire du 17/09/2026 a produit 98 examens enfant vides sur
 * 189. L'écran ne savait nettoyer que l'adulte : ces examens comptaient
 * partout comme réalisés, et les purger supposait un accès à la base.
 */
describe('Purge des examens enfant vides', () => {
  const planEnfant = {
    jour: '2026-09-17',
    examens_concernes: 189,
    supprimes: 98,
    numeros: ['EXE-0001', 'EXE-0002'],
    simulation: true,
    rapport: '',
  };

  test('l’opération choisie est transmise au serveur', async () => {
    let recu: Record<string, unknown> | null = null;
    server.use(
      http.post(
        `${env.API_URL}/analytics/qualite/nettoyage/simulation/`,
        async ({ request }) => {
          recu = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(planEnfant);
        },
      ),
    );

    const user = userEvent.setup({ pointerEventsCheck: 0 });
    rendre();
    await user.click(screen.getByRole('tab', { name: 'Examens enfant vides' }));
    await user.click(screen.getByText('Analyser cette journée'));

    expect(await screen.findByText('Ce qui sera fait')).toBeVisible();
    await waitFor(() => expect(recu?.operation).toBe('coquilles_enfant'));
    expect(screen.getByText('98')).toBeVisible();
    expect(screen.getByText('Appliquer la purge')).toBeVisible();
  });

  test('changer d’opération efface un plan devenu trompeur', async () => {
    server.use(
      http.post(`${env.API_URL}/analytics/qualite/nettoyage/simulation/`, () =>
        HttpResponse.json(plan()),
      ),
    );

    const user = userEvent.setup({ pointerEventsCheck: 0 });
    rendre();
    await user.click(screen.getByText('Analyser cette journée'));
    expect(await screen.findByText('Ce qui sera fait')).toBeVisible();

    // Appliquer un plan calculé pour les doublons adulte alors que l'écran
    // affiche la purge enfant supprimerait autre chose que ce qui est annoncé.
    await user.click(screen.getByRole('tab', { name: 'Examens enfant vides' }));

    expect(screen.queryByText('Ce qui sera fait')).not.toBeInTheDocument();
  });
});

/**
 * Après la purge des coquilles, 24 enfants du 17/09 portaient encore plusieurs
 * examens MESURÉS. La fusion enfant est proposée au même endroit que celle de
 * l'adulte, avec les mêmes garde-fous.
 */
describe('Fusion des doublons enfant', () => {
  const planEnfant = {
    jour: '2026-09-17',
    examens_concernes: 52,
    patients: 24,
    fusions: 31,
    supprimes: 28,
    conflits: 9,
    simulation: true,
    rapport: '',
  };

  test('annonce les valeurs concurrentes avant d’écrire', async () => {
    let recu: Record<string, unknown> | null = null;
    server.use(
      http.post(
        `${env.API_URL}/analytics/qualite/nettoyage/simulation/`,
        async ({ request }) => {
          recu = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json(planEnfant);
        },
      ),
    );

    const user = userEvent.setup({ pointerEventsCheck: 0 });
    rendre();
    await user.click(screen.getByRole('tab', { name: 'Doublons (enfant)' }));
    await user.click(screen.getByText('Analyser cette journée'));

    expect(await screen.findByText('Ce qui sera fait')).toBeVisible();
    await waitFor(() => expect(recu?.operation).toBe('doublons_enfant'));
    expect(screen.getByText('9')).toBeVisible();
    // Ce sont ces valeurs-là qui appelleront un médecin : le dire avant.
    expect(
      screen.getByText(/ne sont jamais tranchées\s+automatiquement/),
    ).toBeVisible();
  });
});
