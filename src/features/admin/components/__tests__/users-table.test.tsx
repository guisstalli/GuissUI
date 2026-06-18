import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { describe, expect, test, vi, afterEach } from 'vitest';

import { server } from '@/testing/mocks/server';
import {
  adminHandlers,
  mockAdminUsers,
} from '@/testing/mocks/handlers/admin';

// Suppress next-auth telemetry fetch that causes URLSearchParams errors in jsdom
vi.mock('next-auth/react', async () => {
  const actual =
    await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return {
    ...actual,
    getSession: vi.fn().mockResolvedValue(null),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
});

// Activate admin handlers before each test because setup-tests.ts calls
// server.resetHandlers() in afterEach, which would remove them.
beforeEach(() => {
  server.use(...adminHandlers);
});

// Safety net: ensure real timers are always restored
afterEach(() => {
  vi.useRealTimers();
});

import { UsersTable } from '../users-table';

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

function renderTable() {
  return render(<UsersTable />, { wrapper: createWrapper() });
}

describe('UsersTable', () => {
  test('renders the table column headers', async () => {
    renderTable();

    await screen.findByText('Utilisateur');
    expect(screen.getByText('Rôle')).toBeInTheDocument();
    expect(screen.getByText('Statut')).toBeInTheDocument();
    expect(screen.getByText('Téléphone')).toBeInTheDocument();
    expect(screen.getByText('Inscrit le')).toBeInTheDocument();
  });

  test('renders a row for each user returned by the API', async () => {
    renderTable();

    await screen.findByText('alice@guiss.sn');
    expect(screen.getByText('bob@guiss.sn')).toBeInTheDocument();
    expect(screen.getByText('carol@guiss.sn')).toBeInTheDocument();
  });

  test('displays the user full name when user_profile is present', async () => {
    renderTable();

    await screen.findByText('Alice Dupont');
    expect(screen.getByText('Bob Martin')).toBeInTheDocument();
  });

  test('displays the role badge for each user', async () => {
    renderTable();

    await screen.findByText('Médecin');
    expect(screen.getByText('Staff')).toBeInTheDocument();
    expect(screen.getByText('Technicien')).toBeInTheDocument();
  });

  test('displays active and inactive status badges', async () => {
    renderTable();

    await screen.findAllByText('Actif');
    expect(screen.getByText('Inactif')).toBeInTheDocument();
  });

  test('shows the total user count below the table', async () => {
    renderTable();

    await screen.findByText(/3 utilisateurs au total/i);
  });

  test('shows "Aucun utilisateur trouvé" when the API returns an empty list', async () => {
    server.use(
      http.get('http://localhost:8000/users/', () =>
        HttpResponse.json({
          count: 0,
          next: null,
          previous: null,
          results: [],
        }),
      ),
    );

    renderTable();

    await screen.findByText(/aucun utilisateur trouvé/i);
  });

  test('renders the email search input', async () => {
    renderTable();

    await screen.findByText('alice@guiss.sn');
    expect(
      screen.getByPlaceholderText(/rechercher par email/i),
    ).toBeInTheDocument();
  });

  test('renders role and status filter dropdowns', async () => {
    renderTable();

    await screen.findByText('alice@guiss.sn');
    expect(screen.getByDisplayValue('Tous les rôles')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Tous les statuts')).toBeInTheDocument();
  });

  test('renders the "Créer un utilisateur" button in the toolbar', async () => {
    renderTable();

    await screen.findByText('alice@guiss.sn');
    expect(
      screen.getByRole('button', { name: /créer un utilisateur/i }),
    ).toBeInTheDocument();
  });

  // ─── Debounce email filter ─────────────────────────────────────────────────
  // The component debounces the email filter by 300ms. We type into the input
  // and then wait > 300ms using real timers + waitFor with a generous timeout.

  test(
    'sends the email param in the URL after debounce',
    async () => {
      let capturedUrl = '';
      server.use(
        http.get('http://localhost:8000/users/', ({ request }) => {
          capturedUrl = request.url;
          const url = new URL(request.url);
          const emailFilter = url.searchParams.get('email');
          const filtered = emailFilter
            ? mockAdminUsers.filter((u) => u.email.includes(emailFilter))
            : mockAdminUsers;
          return HttpResponse.json({
            count: filtered.length,
            next: null,
            previous: null,
            results: filtered,
          });
        }),
      );

      const user = userEvent.setup();
      renderTable();

      // Wait for initial load
      await screen.findByText('alice@guiss.sn');

      const searchInput = screen.getByPlaceholderText(/rechercher par email/i);
      await user.type(searchInput, 'alice');

      // Wait for the debounce (300ms) to fire and for a new request to be made
      await waitFor(
        () => {
          expect(capturedUrl).toContain('email=alice');
        },
        { timeout: 2000 },
      );
    },
    10000,
  );

  test(
    'shows a reset-filters button when email filter yields no results',
    async () => {
      server.use(
        http.get('http://localhost:8000/users/', ({ request }) => {
          const url = new URL(request.url);
          const emailFilter = url.searchParams.get('email');
          if (emailFilter) {
            return HttpResponse.json({
              count: 0,
              next: null,
              previous: null,
              results: [],
            });
          }
          return HttpResponse.json({
            count: mockAdminUsers.length,
            next: null,
            previous: null,
            results: mockAdminUsers,
          });
        }),
      );

      const user = userEvent.setup();
      renderTable();

      // Wait for initial load
      await screen.findByText('alice@guiss.sn');

      const searchInput = screen.getByPlaceholderText(/rechercher par email/i);
      await user.type(searchInput, 'zzz-nobody');

      // Wait for debounce + API response + re-render
      await screen.findByText(/aucun utilisateur trouvé/i, {}, { timeout: 2000 });
      expect(
        screen.getByRole('button', { name: /réinitialiser les filtres/i }),
      ).toBeInTheDocument();
    },
    10000,
  );
});
