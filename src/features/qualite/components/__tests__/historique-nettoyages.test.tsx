import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { describe, expect, test } from 'vitest';

import { env } from '@/config/env';
import { HistoriqueNettoyages } from '@/features/qualite/components/historique-nettoyages';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils';

const rendre = ({ peutRestaurer = true }: { peutRestaurer?: boolean } = {}) =>
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
      <HistoriqueNettoyages peutRestaurer={peutRestaurer} />
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
    await user.click(
      await screen.findByRole('button', { name: /^Restaurer$/ }),
    );

    // Restaurer réinsère des examens : rien ne part avant confirmation.
    expect(
      await screen.findByText(/examens archivés seront réinsérés/),
    ).toBeInTheDocument();
    expect(restaure).toBeNull();

    await user.click(screen.getByRole('button', { name: /Oui, restaurer/ }));

    await waitFor(() => expect(restaure).toBe(1));
  });

  test('renoncer à la restauration ne touche à rien', async () => {
    let restaure = false;
    server.use(
      http.get(`${env.API_URL}/analytics/qualite/nettoyage/historique/`, () =>
        HttpResponse.json([run()]),
      ),
      http.post(
        `${env.API_URL}/analytics/qualite/nettoyage/1/restaurer/`,
        () => {
          restaure = true;
          return HttpResponse.json(run({ statut: 'restaure' }));
        },
      ),
    );

    const user = userEvent.setup({ pointerEventsCheck: 0 });
    rendre();
    await user.click(
      await screen.findByRole('button', { name: /^Restaurer$/ }),
    );
    await user.click(await screen.findByRole('button', { name: /^Annuler$/ }));

    await waitFor(() =>
      expect(
        screen.queryByText(/examens archivés seront réinsérés/),
      ).not.toBeInTheDocument(),
    );
    expect(restaure).toBe(false);
  });

  test('sans la capacité de nettoyer, l’historique se lit mais ne se défait pas', async () => {
    // Même règle que le serveur (quality.clean) : l'agent de saisie voit ce
    // qui a été fait, sans bouton qui lui renverrait un 403.
    server.use(
      http.get(`${env.API_URL}/analytics/qualite/nettoyage/historique/`, () =>
        HttpResponse.json([run()]),
      ),
    );
    rendre({ peutRestaurer: false });

    expect(await screen.findByText('Tâche de 5 h')).toBeVisible();
    expect(
      screen.queryByRole('button', { name: /Restaurer/ }),
    ).not.toBeInTheDocument();
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
