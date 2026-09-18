import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { describe, expect, test } from 'vitest';

import { env } from '@/config/env';
import { BilanCampagne } from '@/features/campagne/components/bilan-campagne';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen } from '@/testing/test-utils';

const rendre = () =>
  rtlRender(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <BilanCampagne
        campagne={{ siteId: 7, eventId: null, libelle: 'Gare Routière' }}
      />
    </QueryClientProvider>,
  );

const bilan = (partiel: Record<string, unknown> = {}) => ({
  jour: '2026-09-18',
  passages: 189,
  adultes: 0,
  enfants: 189,
  avec_mesure: 91,
  sans_mesure: 98,
  complets: 60,
  taux_mesure: 48.1,
  taux_complet: 31.7,
  seuil_interpretation: 10,
  effectif_interpretable: true,
  ...partiel,
});

/**
 * Les deux chiffres qui manquaient : le dénominateur réel et le seuil
 * d'interprétation.
 */
describe('Bilan de campagne', () => {
  test('les dossiers sans aucune mesure sont comptés à part', async () => {
    server.use(
      http.get(`${env.API_URL}/depistage/campagne/completude/`, () =>
        HttpResponse.json(bilan()),
      ),
    );

    rendre();

    expect(await screen.findByText('91')).toBeVisible();
    expect(
      screen.getByText(/98 dossier\(s\) ouvert\(s\) sans aucune mesure/),
    ).toBeVisible();
  });

  test('sous le seuil, l’écran dit que les proportions ne veulent rien dire', async () => {
    server.use(
      http.get(`${env.API_URL}/depistage/campagne/completude/`, () =>
        HttpResponse.json(
          bilan({
            passages: 6,
            enfants: 6,
            avec_mesure: 6,
            sans_mesure: 0,
            effectif_interpretable: false,
          }),
        ),
      ),
    );

    rendre();

    expect(
      await screen.findByText(/ne sont pas\s+interprétables/),
    ).toBeVisible();
  });
});
