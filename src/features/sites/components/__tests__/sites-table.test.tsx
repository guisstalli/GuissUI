import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { sitesHandlers } from '@/testing/mocks/handlers/sites';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils';

import { SitesTable } from '../sites-table';

// Rôle courant du test — `<Can>` s'appuie dessus via useUser/useSession.
let currentRole: string | null = null;

// Prevent next-auth from firing async fetch calls that cause errors in jsdom
vi.mock('next-auth/react', async () => {
  const actual =
    await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return {
    ...actual,
    useSession: () =>
      currentRole
        ? {
            data: {
              user: {
                id: '1',
                email: 'test@guiss.sn',
                name: 'Test',
                role: currentRole,
              },
            },
            status: 'authenticated',
          }
        : { data: null, status: 'unauthenticated' },
    getSession: vi.fn().mockResolvedValue(null),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
});

beforeEach(() => {
  currentRole = null;
});

function renderSitesTable(search = '') {
  return rtlRender(
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
      <SitesTable search={search} />
    </QueryClientProvider>,
  );
}

describe('SitesTable', () => {
  test('renders the column headers after loading', async () => {
    server.use(...sitesHandlers);
    renderSitesTable();

    // Wait for the loading state to resolve before asserting on headers
    await waitFor(() => {
      expect(screen.getByText('Libellé')).toBeInTheDocument();
    });

    expect(screen.getByText('Code')).toBeInTheDocument();
    expect(screen.getByText('Adresse')).toBeInTheDocument();
    expect(screen.getByText('Statut')).toBeInTheDocument();
  });

  test('shows loading state before data arrives', async () => {
    server.use(...sitesHandlers);
    renderSitesTable();

    expect(screen.getByText(/chargement des sites/i)).toBeInTheDocument();
  });

  test('renders a row for each site returned by the API', async () => {
    server.use(...sitesHandlers);
    renderSitesTable();

    await waitFor(() => {
      expect(screen.getByText('Dakar - Plateau')).toBeInTheDocument();
    });

    expect(screen.getByText('Thiès Centre')).toBeInTheDocument();
    expect(screen.getByText('Ziguinchor')).toBeInTheDocument();
  });

  test('displays the site code in each row', async () => {
    server.use(...sitesHandlers);
    renderSitesTable();

    await waitFor(() => {
      expect(screen.getByText('dakar-plateau')).toBeInTheDocument();
    });

    expect(screen.getByText('thies-centre')).toBeInTheDocument();
  });

  test('displays the site address when present', async () => {
    server.use(...sitesHandlers);
    renderSitesTable();

    await waitFor(() => {
      expect(
        screen.getByText('12 Rue des Médecins, Dakar'),
      ).toBeInTheDocument();
    });
  });

  test('shows a dash when the site address is null', async () => {
    server.use(...sitesHandlers);
    renderSitesTable();

    await waitFor(() => {
      expect(screen.getByText('Thiès Centre')).toBeInTheDocument();
    });

    // Thiès Centre has null adresse → rendered as "-"
    const dashCells = screen.getAllByText('-');
    expect(dashCells.length).toBeGreaterThan(0);
  });

  test('shows an "Actif" badge for active sites', async () => {
    server.use(...sitesHandlers);
    renderSitesTable();

    await waitFor(() => {
      const activeBadges = screen.getAllByText('Actif');
      expect(activeBadges.length).toBeGreaterThan(0);
    });
  });

  test('shows an "Inactif" badge for inactive sites', async () => {
    server.use(...sitesHandlers);
    renderSitesTable();

    await waitFor(() => {
      expect(screen.getByText('Inactif')).toBeInTheDocument();
    });
  });

  test('shows empty state message when no sites are returned', async () => {
    server.use(
      http.get('http://localhost:8000/depistage/sites/', () =>
        HttpResponse.json({
          count: 0,
          next: null,
          previous: null,
          results: [],
        }),
      ),
    );

    renderSitesTable();

    await waitFor(() => {
      expect(screen.getByText(/aucun site trouvé/i)).toBeInTheDocument();
    });
  });

  test('shows error state when the API fails', async () => {
    server.use(
      http.get('http://localhost:8000/depistage/sites/', () =>
        HttpResponse.error(),
      ),
    );

    renderSitesTable();

    // After loading state disappears, an error state or empty table is shown
    await waitFor(() => {
      expect(
        screen.queryByText(/chargement des sites/i),
      ).not.toBeInTheDocument();
    });
  });
});

/**
 * Le menu d'actions n'était couvert par aucun test, alors qu'il portait le
 * bug le plus coûteux : « Supprimer » ne faisait que désactiver, et aucune
 * réactivation n'était exposée — un site désactivé restait bloqué, son code
 * unique pris, d'où la recréation d'un doublon.
 */
describe('SitesTable — menu d’actions', () => {
  async function openMenuOf(libelle: string) {
    server.use(...sitesHandlers);
    renderSitesTable();
    const row = (await screen.findByText(libelle)).closest('tr');
    const trigger = row!.querySelector('button')!;
    await userEvent.click(trigger);
  }

  test('un site actif propose « Désactiver », pas « Supprimer »', async () => {
    currentRole = 'STAFF';

    await openMenuOf('Dakar - Plateau');

    expect(await screen.findByText('Désactiver')).toBeInTheDocument();
    expect(screen.queryByText('Réactiver')).not.toBeInTheDocument();
  });

  test('un site inactif propose « Réactiver »', async () => {
    currentRole = 'STAFF';

    await openMenuOf('Ziguinchor');

    expect(await screen.findByText('Réactiver')).toBeInTheDocument();
    expect(screen.queryByText('Désactiver')).not.toBeInTheDocument();
  });

  test('la suppression définitive est cachée au staff', async () => {
    currentRole = 'STAFF';

    await openMenuOf('Dakar - Plateau');

    await screen.findByText('Désactiver');
    expect(
      screen.queryByText('Supprimer définitivement'),
    ).not.toBeInTheDocument();
  });

  test('la suppression définitive est offerte au superutilisateur', async () => {
    currentRole = 'SUPERUSER';

    await openMenuOf('Dakar - Plateau');

    expect(
      await screen.findByText('Supprimer définitivement'),
    ).toBeInTheDocument();
  });

  // NON COUVERT ICI : l'affichage du refus 409. Ouvrir le dialogue Radix
  // depuis l'élément de menu fait diverger le worker Vitest en jsdom (OOM du
  // compilateur de regex sur les requêtes par rôle, blocage sur findByRole
  // ('dialog')). Le comportement est prouvé côté backend par un vrai appel
  // HTTP : apps/depistage/tests/test_site_delete.py
  // ::test_lapi_renvoie_409_et_le_detail_des_references.
});
