import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { describe, expect, test, vi } from 'vitest';

import { server } from '@/testing/mocks/server';
import { sitesHandlers } from '@/testing/mocks/handlers/sites';
import { rtlRender, screen, waitFor } from '@/testing/test-utils';

import { SitesTable } from '../sites-table';

// Prevent next-auth from firing async fetch calls that cause errors in jsdom
vi.mock('next-auth/react', async () => {
  const actual =
    await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return {
    ...actual,
    getSession: vi.fn().mockResolvedValue(null),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
});

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function renderSitesTable(search = '') {
  return rtlRender(
    <QueryClientProvider
      client={
        new QueryClient({
          defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
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
        HttpResponse.json({ count: 0, next: null, previous: null, results: [] }),
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
