import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { describe, expect, test } from 'vitest';

import { env } from '@/config/env';
import { FileDuJour } from '@/features/campagne/components/file-du-jour';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen } from '@/testing/test-utils';

const rendre = () =>
  rtlRender(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <FileDuJour
        campagne={{ siteId: 7, eventId: null, libelle: 'Gare Routière' }}
      />
    </QueryClientProvider>,
  );

const ligne = (partiel: Record<string, unknown>) => ({
  examen_id: 1,
  numero_examen: 'EXC-0001',
  type_examen: 'enfant',
  heure: '2026-09-18T09:30:00Z',
  commence: false,
  complet: false,
  motif_reprise: '',
  patient: {
    id: 1,
    nom_complet: 'Moussa Sow',
    age: 10,
    sex: 'H',
    numero_identifiant: 'P-1',
  },
  ...partiel,
});

/**
 * Le 17/09/2026, 98 examens enfant sur 189 sont restés vides. Personne n'avait,
 * sur place, de vue disant lesquels attendaient encore une mesure.
 */
describe('File du jour', () => {
  test('compte les passages sans aucune mesure', async () => {
    server.use(
      http.get(`${env.API_URL}/depistage/campagne/file/`, () =>
        HttpResponse.json([
          ligne({ examen_id: 1 }),
          ligne({ examen_id: 2, commence: true }),
          ligne({ examen_id: 3, commence: true, complet: true }),
        ]),
      ),
    );

    rendre();

    expect(await screen.findByText('3')).toBeVisible();
    expect(screen.getByText(/sans\s+aucune mesure/)).toBeVisible();
    expect(screen.getByText('à mesurer')).toBeVisible();
    expect(screen.getByText('en cours')).toBeVisible();
    expect(screen.getByText('terminé')).toBeVisible();
  });
});
