import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { describe, expect, test } from 'vitest';

import { env } from '@/config/env';
import { CourbeTendance } from '@/features/qualite/components/courbe-tendance';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen } from '@/testing/test-utils';

const rendre = () =>
  rtlRender(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <CourbeTendance dateDebut="2026-08-01" dateFin="2026-08-31" />
    </QueryClientProvider>,
  );

describe('Courbe de tendance', () => {
  test('une période sans examen le dit au lieu de tracer une ligne plate', async () => {
    server.use(
      http.get(`${env.API_URL}/analytics/qualite/tendance/`, () =>
        HttpResponse.json([]),
      ),
    );

    rendre();

    // Un graphique vide se confond avec un graphique à zéro anomalie : le
    // premier veut dire « rien saisi », le second « tout va bien ».
    expect(
      await screen.findByText('Aucun examen sur la période.'),
    ).toBeVisible();
  });

  test('une erreur ne se déguise pas en absence d’anomalie', async () => {
    server.use(
      http.get(`${env.API_URL}/analytics/qualite/tendance/`, () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    );

    rendre();

    expect(
      await screen.findByText('Impossible de charger la tendance.'),
    ).toBeVisible();
  });

  test('affiche la légende quand des données arrivent', async () => {
    server.use(
      http.get(`${env.API_URL}/analytics/qualite/tendance/`, () =>
        HttpResponse.json([
          {
            jour: '2026-08-19',
            examens: 7,
            doublons: 2,
            sans_site: 5,
            coquilles_vides: 0,
          },
          {
            jour: '2026-08-23',
            examens: 114,
            doublons: 15,
            sans_site: 38,
            coquilles_vides: 17,
          },
        ]),
      ),
    );

    rendre();

    expect(await screen.findByText('Évolution des anomalies')).toBeVisible();
  });
});
