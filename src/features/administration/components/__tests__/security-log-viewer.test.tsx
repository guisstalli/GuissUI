import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { describe, expect, test } from 'vitest';

import { env } from '@/config/env';
import {
  administrationHandlers,
  mockSecurityAuditEmpty,
  mockSecurityAuditPage1,
} from '@/testing/mocks/handlers/administration';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, userEvent, waitFor } from '@/testing/test-utils';

import { SecurityLogViewer } from '../security-log-viewer';

// =============================================================================
// Helpers
// =============================================================================

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderViewer() {
  return rtlRender(
    <QueryClientProvider client={createQueryClient()}>
      <SecurityLogViewer />
    </QueryClientProvider>,
  );
}

// =============================================================================
// Tests
// =============================================================================

describe('SecurityLogViewer', () => {
  test('renders table rows from the mocked paginated response', async () => {
    server.use(...administrationHandlers);

    renderViewer();

    // Row 1: LOGIN_FAILED for alice@guiss.sn
    // "Connexion échouée" appears both as a select option and as a badge —
    // we just need at least one occurrence.
    expect(
      (await screen.findAllByText('Connexion échouée')).length,
    ).toBeGreaterThan(0);
    expect(screen.getByText('alice@guiss.sn')).toBeInTheDocument();
    expect(screen.getByText('41.82.0.1')).toBeInTheDocument();

    // Row 2: ACCESS_DENIED — also appears as option + badge
    expect(screen.getAllByText('Accès refusé').length).toBeGreaterThan(0);
  });

  test('shows the total event count below the table', async () => {
    server.use(...administrationHandlers);

    renderViewer();

    // count=45 → "45 événements au total"
    await screen.findByText(/45 événements au total/i);
  });

  test('shows empty state message when no events are returned', async () => {
    server.use(
      http.get(`${env.API_URL}/users/security-audit/`, () =>
        HttpResponse.json(mockSecurityAuditEmpty),
      ),
    );

    renderViewer();

    await screen.findByText(/aucun événement trouvé/i);
  });

  test('shows error state when the API fails', async () => {
    server.use(
      http.get(`${env.API_URL}/users/security-audit/`, () =>
        HttpResponse.error(),
      ),
    );

    renderViewer();

    await screen.findByText(/impossible de charger le journal de sécurité/i);
    expect(
      screen.getByRole('button', { name: /réessayer/i }),
    ).toBeInTheDocument();
  });

  test('selecting an event type filter sends the event param in the next request', async () => {
    const user = userEvent.setup();

    let capturedEvent: string | null = null;
    server.use(
      http.get(`${env.API_URL}/users/security-audit/`, ({ request }) => {
        const url = new URL(request.url);
        capturedEvent = url.searchParams.get('event');
        return HttpResponse.json(mockSecurityAuditPage1);
      }),
    );

    renderViewer();

    // Wait for data so the select is populated with event options
    await screen.findByText('Connexion échouée');

    // The select is labelled "Type d'événement"
    const select = screen.getByRole('combobox');
    await user.selectOptions(select, 'LOGIN_FAILED');

    await waitFor(() => {
      expect(capturedEvent).toBe('LOGIN_FAILED');
    });
  });

  test('expand button shows metadata JSON for a row that has metadata', async () => {
    server.use(...administrationHandlers);

    renderViewer();

    await screen.findByText('alice@guiss.sn');

    // First row has metadata { browser: 'Firefox', attempt: 2 }
    const expandButtons = screen.getAllByRole('button', {
      name: /voir les détails/i,
    });
    expect(expandButtons.length).toBeGreaterThan(0);

    await userEvent.click(expandButtons[0]);

    // JSON is rendered in a <pre> block
    await screen.findByText(/"browser"/);
    expect(screen.getByText(/"Firefox"/)).toBeInTheDocument();
  });

  test('expand button is disabled for a row with no metadata', async () => {
    server.use(...administrationHandlers);

    renderViewer();

    await screen.findByText('Accès refusé');

    const expandButtons = screen.getAllByRole('button', {
      name: /voir les détails/i,
    });

    // Second row (ACCESS_DENIED) has empty metadata — button must be disabled
    expect(expandButtons[1]).toBeDisabled();
  });

  test('expand button label changes to "Masquer les détails" after clicking', async () => {
    server.use(...administrationHandlers);

    renderViewer();

    await screen.findByText('alice@guiss.sn');

    const expandButton = screen.getAllByRole('button', {
      name: /voir les détails/i,
    })[0];
    await userEvent.click(expandButton);

    await screen.findByRole('button', { name: /masquer les détails/i });
  });

  test('filter bar renders event-type select, date inputs, user-id and IP fields', async () => {
    server.use(...administrationHandlers);

    renderViewer();

    // Labels for date range fields
    expect(screen.getByLabelText('Du')).toBeInTheDocument();
    expect(screen.getByLabelText('Au')).toBeInTheDocument();
    expect(screen.getByLabelText('ID utilisateur')).toBeInTheDocument();
    expect(screen.getByLabelText('Adresse IP')).toBeInTheDocument();
  });
});
