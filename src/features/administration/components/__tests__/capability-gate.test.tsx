import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { describe, expect, test } from 'vitest';

import { env } from '@/config/env';
import {
  administrationHandlers,
  mockMyCapabilitiesEmpty,
  mockMyCapabilitiesSuperuser,
} from '@/testing/mocks/handlers/administration';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, waitFor } from '@/testing/test-utils';

import { CapabilityGate } from '../capability-gate';

// =============================================================================
// Helpers
// =============================================================================

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderGate(capability: string, child = <p>Contenu protégé</p>) {
  return rtlRender(
    <QueryClientProvider client={createQueryClient()}>
      <CapabilityGate capability={capability}>{child}</CapabilityGate>
    </QueryClientProvider>,
  );
}

// =============================================================================
// Tests
// =============================================================================

describe('CapabilityGate', () => {
  test('shows children when user has the required capability', async () => {
    server.use(...administrationHandlers);

    renderGate('ai.chat.access');

    await screen.findByText('Contenu protégé');
    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
  });

  test('shows "Accès non autorisé" when user lacks the capability', async () => {
    server.use(
      http.get(`${env.API_URL}/users/me/capabilities/`, () =>
        HttpResponse.json(mockMyCapabilitiesEmpty),
      ),
    );

    renderGate('permissions.manage');

    await screen.findByText(/accès non autorisé/i);
    expect(screen.getByText(/accès non autorisé/i)).toBeInTheDocument();
    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
  });

  test('shows "Accès non autorisé" when API call fails', async () => {
    server.use(
      http.get(`${env.API_URL}/users/me/capabilities/`, () =>
        HttpResponse.error(),
      ),
    );

    renderGate('ai.chat.access');

    await waitFor(() => {
      expect(screen.getByText(/accès non autorisé/i)).toBeInTheDocument();
    });
    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
  });

  test('superuser sees children regardless of capability list being empty', async () => {
    server.use(
      http.get(`${env.API_URL}/users/me/capabilities/`, () =>
        HttpResponse.json(mockMyCapabilitiesSuperuser),
      ),
    );

    renderGate('some.unknown.capability');

    await screen.findByText('Contenu protégé');
    expect(screen.getByText('Contenu protégé')).toBeInTheDocument();
  });

  test('shows neither children nor unauthorized message while capabilities are loading', () => {
    // Use a handler that never resolves so we capture the loading state.
    server.use(
      http.get(
        `${env.API_URL}/users/me/capabilities/`,
        () => new Promise(() => undefined),
      ),
    );

    renderGate('ai.chat.access');

    expect(screen.queryByText('Contenu protégé')).not.toBeInTheDocument();
    expect(screen.queryByText(/accès non autorisé/i)).not.toBeInTheDocument();
  });
});
