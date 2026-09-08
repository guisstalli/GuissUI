import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { describe, expect, test } from 'vitest';

import { env } from '@/config/env';
import { CarteArbitrage } from '@/features/qualite/components/carte-arbitrage';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils';

import type { Arbitrage } from '../../types/types';

const arbitrage = (partiel: Partial<Arbitrage> = {}): Arbitrage => ({
  id: 7,
  jour: '2026-08-23',
  patient_id: 3699,
  patient_nom: 'Patient 3699',
  examen_conserve_id: 2705,
  examen_ecarte_id: 2711,
  numero_examen_ecarte: 'EX-2711',
  composant: 'refraction',
  champ: 'od_s',
  composant_libelle: 'Réfraction',
  champ_libelle: 'Sphère OD',
  valeur_conservee: '0.500',
  valeur_ecartee: '-0.750',
  statut: 'en_attente',
  commentaire: null,
  decide_le: null,
  decide_par_email: null,
  ...partiel,
});

const rendre = (valeur: Arbitrage) =>
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
      <CarteArbitrage arbitrage={valeur} />
    </QueryClientProvider>,
  );

/**
 * Ce que ces tests protègent : les DEUX valeurs doivent être lisibles avant
 * tout clic. Un écran qui n'afficherait que la valeur retenue transformerait
 * l'arbitrage en confirmation — le mécanisme même qui a rendu 24 mesures
 * inexploitables en août 2026.
 */
describe('Carte d’arbitrage', () => {
  test('montre les deux valeurs concurrentes et leur intitulé clinique', () => {
    rendre(arbitrage());

    expect(screen.getByText('Réfraction — Sphère OD')).toBeVisible();
    expect(screen.getByText('0.500')).toBeVisible();
    expect(screen.getByText('-0.750')).toBeVisible();
  });

  test('une valeur vide reste visible comme telle', () => {
    rendre(arbitrage({ valeur_conservee: '' }));

    // Une case blanche laisserait croire à un bug d'affichage plutôt qu'à
    // l'absence de mesure — or l'absence est une information clinique.
    expect(screen.getByText('— (vide)')).toBeVisible();
  });

  test('transmet la décision et le motif au serveur', async () => {
    let recu: unknown = null;
    server.use(
      http.post(
        `${env.API_URL}/analytics/arbitrages/7/decision/`,
        async ({ request }) => {
          recu = await request.json();
          return HttpResponse.json({ ...arbitrage(), statut: 'remplacee' });
        },
      ),
    );

    const user = userEvent.setup({ pointerEventsCheck: 0 });
    rendre(arbitrage());

    await user.type(
      screen.getByLabelText(/Motif/),
      'mesure refaite en fin de séance',
    );
    await user.click(
      screen.getByRole('button', { name: /Retenir la valeur écartée/ }),
    );

    await waitFor(() =>
      expect(recu).toEqual({
        decision: 'remplacee',
        commentaire: 'mesure refaite en fin de séance',
      }),
    );
  });

  test('un arbitrage déjà tranché n’offre plus de boutons', () => {
    rendre(
      arbitrage({
        statut: 'remplacee',
        decide_le: '2026-09-08T10:00:00Z',
        decide_par_email: 'docteur@guiss.sn',
        commentaire: 'mesure refaite',
      }),
    );

    expect(
      screen.queryByRole('button', { name: /Retenir la valeur écartée/ }),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/le dossier a été modifié/)).toBeVisible();
    expect(screen.getByText(/docteur@guiss.sn/)).toBeVisible();
  });
});
