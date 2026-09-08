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
    libelle: 'Plusieurs examens pour un patient le même jour',
    gravite: 'critique',
    explication: 'Les données cliniques se dispersent entre les doublons.',
    nombre: 15,
  },
  {
    code: 'sans_site',
    libelle: 'Examen sans site de dépistage',
    gravite: 'majeure',
    explication: "L'examen disparaît de toute analyse par site.",
    nombre: 38,
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
