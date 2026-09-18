import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { describe, expect, test } from 'vitest';

import { env } from '@/config/env';
import { PanneauLieux } from '@/features/qualite/components/panneau-lieux';
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
      <PanneauLieux />
    </QueryClientProvider>,
  );

const plan = (partiel: Record<string, unknown> = {}) => ({
  patients: 3441,
  rattaches: 3157,
  ambigus: 3,
  sans_examen: 246,
  deja_rattaches: 0,
  applique: false,
  ...partiel,
});

/**
 * Dump du 18/09/2026 : 3 441 patients, aucun lieu. Ces tests protègent les
 * deux garde-fous du rattrapage : on annonce avant d'écrire, et on ne devine
 * jamais le lieu d'un patient examiné à deux endroits.
 */
describe('Panneau des lieux', () => {
  test('l’analyse annonce ce qui serait rattaché, sans écrire', async () => {
    let applique: unknown = null;
    server.use(
      http.post(
        `${env.API_URL}/analytics/qualite/sites/rattachement/`,
        async ({ request }) => {
          const corps = (await request.json()) as { appliquer: boolean };
          applique = corps.appliquer;
          return HttpResponse.json(plan());
        },
      ),
      http.get(`${env.API_URL}/analytics/qualite/sites/doublons/`, () =>
        HttpResponse.json([]),
      ),
    );

    const user = userEvent.setup({ pointerEventsCheck: 0 });
    rendre();
    await user.click(screen.getByText('Analyser les rattachements'));

    expect(await screen.findByText('3157')).toBeVisible();
    // Les ambigus sont montrés, pas rattachés : choisir à leur place
    // inventerait une donnée.
    expect(screen.getByText('3')).toBeVisible();
    expect(applique).toBe(false);
  });

  test('les deux écritures d’un même lieu sont proposées à la fusion', async () => {
    server.use(
      http.get(`${env.API_URL}/analytics/qualite/sites/doublons/`, () =>
        HttpResponse.json([
          {
            cle: 'claire amitie',
            sites: [
              { id: 1, libelle: 'CLAIRE AMITIÉ', code: 'S1', is_active: true },
              { id: 2, libelle: 'Claire amitie', code: 'S2', is_active: true },
            ],
          },
        ]),
      ),
    );

    rendre();

    await waitFor(() =>
      expect(screen.getByText(/Garder « CLAIRE AMITIÉ »/)).toBeVisible(),
    );
    expect(screen.getByText(/Garder « Claire amitie »/)).toBeVisible();
  });
});
