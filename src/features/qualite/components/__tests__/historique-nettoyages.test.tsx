import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { describe, expect, test } from 'vitest';

import { env } from '@/config/env';
import { HistoriqueNettoyages } from '@/features/qualite/components/historique-nettoyages';
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
      <HistoriqueNettoyages />
    </QueryClientProvider>,
  );

const run = (partiel: Record<string, unknown> = {}) => ({
  id: 1,
  operation: 'doublons',
  jour: '2026-08-23',
  declencheur: 'automatique',
  lance_le: '2026-09-08T05:00:00Z',
  lance_par_email: null,
  statut: 'applique',
  examens_concernes: 114,
  fusions: 25,
  supprimes: 32,
  arbitrages_crees: 24,
  rattaches_site: 15,
  archive: '/tmp/archive.json',
  est_restaurable: true,
  restaure_le: null,
  restaure_par_email: null,
  ...partiel,
});

/**
 * La tâche de 5 h fusionnait, archivait et supprimait sans que personne puisse
 * voir son effet. Ces tests protègent ce qui rend l'automatisation inspectable.
 */
describe('Historique des nettoyages', () => {
  test('montre ce que la tâche automatique a fait', async () => {
    server.use(
      http.get(`${env.API_URL}/analytics/qualite/nettoyage/historique/`, () =>
        HttpResponse.json([run()]),
      ),
    );
    rendre();

    expect(await screen.findByText('Tâche de 5 h')).toBeVisible();
    expect(screen.getByText('32')).toBeVisible();
    expect(screen.getByText('24')).toBeVisible();
  });

  test('une exécution appliquée peut être défaite', async () => {
    let restaure: number | null = null;
    server.use(
      http.get(`${env.API_URL}/analytics/qualite/nettoyage/historique/`, () =>
        HttpResponse.json([run()]),
      ),
      http.post(
        `${env.API_URL}/analytics/qualite/nettoyage/1/restaurer/`,
        () => {
          restaure = 1;
          return HttpResponse.json(run({ statut: 'restaure' }));
        },
      ),
    );

    const user = userEvent.setup({ pointerEventsCheck: 0 });
    rendre();
    await user.click(await screen.findByText('Restaurer'));

    await waitFor(() => expect(restaure).toBe(1));
  });

  test('une exécution déjà restaurée n’offre plus le bouton', async () => {
    server.use(
      http.get(`${env.API_URL}/analytics/qualite/nettoyage/historique/`, () =>
        HttpResponse.json([
          run({
            statut: 'restaure',
            est_restaurable: false,
            restaure_le: '2026-09-09T10:00:00Z',
          }),
        ]),
      ),
    );
    rendre();

    expect(await screen.findByText('Restauré')).toBeVisible();
    expect(screen.queryByText('Restaurer')).not.toBeInTheDocument();
  });

  test('aucun nettoyage le dit plutôt que d’afficher un tableau vide', async () => {
    server.use(
      http.get(`${env.API_URL}/analytics/qualite/nettoyage/historique/`, () =>
        HttpResponse.json([]),
      ),
    );
    rendre();

    expect(
      await screen.findByText('Aucun nettoyage exécuté à ce jour.'),
    ).toBeVisible();
  });
});
