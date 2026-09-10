import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { describe, expect, test, vi } from 'vitest';

import { env } from '@/config/env';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen } from '@/testing/test-utils';

import QualiteDonneesPage from '../page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
  usePathname: () => '/administration/qualite',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/app/_shell', () => ({
  AppShell: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const SYNTHESE = [
  {
    code: 'doublons',
    famille: 'examens',
    libelle: 'Plusieurs examens pour un patient le même jour',
    gravite: 'critique',
    explication: 'Les données cliniques se dispersent entre les doublons.',
    nombre: 15,
  },
  {
    code: 'sans_site',
    famille: 'examens',
    libelle: 'Examen sans site de dépistage',
    gravite: 'majeure',
    explication: "L'examen disparaît de toute analyse par site.",
    nombre: 38,
  },
  {
    // Famille « dossiers » : cohérence d'une fiche patient ou conducteur.
    // L'import du 26/06/2026 en a laissé six — des conducteurs dont la date
    // de naissance en fait des enfants de 0 à 7 ans.
    code: 'conducteur_trop_jeune',
    famille: 'dossiers',
    libelle: 'Conducteur de moins de 16 ans',
    gravite: 'critique',
    explication:
      'Date de naissance fausse sur un conducteur réel : il fausse toute analyse par tranche d’âge.',
    nombre: 6,
    importes: 6,
    saisis: 0,
  },
];

function afficher(synthese = SYNTHESE, doublons: unknown[] = []) {
  server.use(
    http.get(`${env.API_URL}/analytics/qualite/`, () =>
      HttpResponse.json(synthese),
    ),
    http.get(`${env.API_URL}/analytics/qualite/doublons/`, () =>
      HttpResponse.json(doublons),
    ),
  );
  rtlRender(
    <QueryClientProvider
      client={
        new QueryClient({ defaultOptions: { queries: { retry: false } } })
      }
    >
      <QualiteDonneesPage />
    </QueryClientProvider>,
  );
}

describe('Écran Qualité des données', () => {
  test('affiche les anomalies avec leur nombre', async () => {
    afficher();

    expect(await screen.findByText('15')).toBeVisible();
    expect(screen.getByText('38')).toBeVisible();
  });

  test('alerte en tête quand une anomalie est critique', async () => {
    afficher();

    expect(
      await screen.findByText(/anomalie\(s\) critique\(s\)/),
    ).toBeVisible();
  });

  test('ne crie pas quand tout est sain', async () => {
    afficher([
      { ...SYNTHESE[0], nombre: 0 },
      { ...SYNTHESE[1], nombre: 0 },
    ]);

    await screen.findAllByText('0');
    // Une bannière permanente finirait par ne plus être lue.
    expect(
      screen.queryByText(/anomalie\(s\) critique\(s\)/),
    ).not.toBeInTheDocument();
  });

  test('liste les patients en doublon', async () => {
    afficher(SYNTHESE, [{ jour: '2026-08-23', patient_id: 3691, examens: 2 }]);

    expect(await screen.findByText('Patient 3691')).toBeVisible();
  });
});

/**
 * Les deux familles ne se corrigent ni au même endroit ni par les mêmes
 * personnes : la saisie d'une séance se reprend le soir même, une fiche
 * héritée de l'ancienne plateforme ne se reprend souvent jamais. Les
 * mélanger dans une même grille rendait l'urgent et l'irréparable
 * indiscernables.
 */
test('sépare la saisie des examens de la cohérence des dossiers', async () => {
  afficher();

  expect(await screen.findByText('Saisie des examens')).toBeVisible();
  expect(screen.getByText('Cohérence des dossiers')).toBeVisible();
  expect(
    screen.getByText(/héritée\(s\) de l’ancienne plateforme/),
  ).toBeVisible();
});
