import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { describe, expect, test } from 'vitest';

import { env } from '@/config/env';
import {
  administrationHandlers,
  mockAdminDashboard,
} from '@/testing/mocks/handlers/administration';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils';

import { AdminDashboard } from '../admin-dashboard';

// =============================================================================
// Helpers
// =============================================================================

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderDashboard() {
  return rtlRender(
    <QueryClientProvider client={createQueryClient()}>
      <AdminDashboard />
    </QueryClientProvider>,
  );
}

// =============================================================================
// Tests
// =============================================================================

describe('AdminDashboard', () => {
  test('renders user KPI card titles after data loads', async () => {
    server.use(...administrationHandlers);

    renderDashboard();

    await screen.findByText('Total');
    expect(screen.getByText('Actifs')).toBeInTheDocument();
    expect(screen.getByText('Vérifiés')).toBeInTheDocument();
  });

  test('renders user KPI values from the mocked payload', async () => {
    server.use(...administrationHandlers);

    renderDashboard();

    // total=42, active=35, verified=38 all appear as text
    await screen.findByText('42');
    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText('38')).toBeInTheDocument();
  });

  test('renders system volumetry section', async () => {
    server.use(...administrationHandlers);

    renderDashboard();

    await screen.findByText('Patients');
    expect(screen.getByText('Conducteurs')).toBeInTheDocument();
    expect(screen.getByText('Rapports IA')).toBeInTheDocument();
  });

  test('renders security KPI for failed logins', async () => {
    server.use(...administrationHandlers);

    renderDashboard();

    await screen.findByText('Connexions échouées (7 j)');
    expect(screen.getByText('3')).toBeInTheDocument(); // login_failed_7d
  });

  test('shows the window days label from the payload', async () => {
    server.use(...administrationHandlers);

    renderDashboard();

    // window_days=14 → text contains "14 derniers jours"
    await screen.findByText(/14 derniers jours/i);
  });

  test('the days selector buttons are rendered', async () => {
    server.use(...administrationHandlers);

    renderDashboard();

    await screen.findByText('42'); // wait for data

    expect(screen.getByRole('button', { name: /7 j/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /14 j/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /30 j/i })).toBeInTheDocument();
  });

  test('14j button has aria-pressed=true by default', async () => {
    server.use(...administrationHandlers);

    renderDashboard();

    await screen.findByText('42');

    expect(screen.getByRole('button', { name: /14 j/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: /7 j/i })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  test('clicking a different days button triggers a refetch with new days param', async () => {
    const user = userEvent.setup();

    let capturedDays: string | null = null;
    server.use(
      http.get(`${env.API_URL}/analytics/admin-dashboard/`, ({ request }) => {
        const url = new URL(request.url);
        capturedDays = url.searchParams.get('days');
        return HttpResponse.json({ ...mockAdminDashboard, window_days: 7 });
      }),
    );

    renderDashboard();

    // Wait for first render (default days=14)
    await screen.findByText(/derniers jours/i);

    // Click the 7j button
    await user.click(screen.getByRole('button', { name: /7 j/i }));

    // The request should have been made with days=7
    await waitFor(() => {
      expect(capturedDays).toBe('7');
    });
  });

  test('shows error state when the API returns a 500', async () => {
    server.use(
      http.get(`${env.API_URL}/analytics/admin-dashboard/`, () =>
        HttpResponse.json({ detail: 'Server error' }, { status: 500 }),
      ),
    );

    renderDashboard();

    await screen.findByText(/impossible de charger le tableau de bord/i);
    expect(
      screen.getByRole('button', { name: /réessayer/i }),
    ).toBeInTheDocument();
  });
});
