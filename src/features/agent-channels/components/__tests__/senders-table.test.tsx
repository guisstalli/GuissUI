/**
 * Tests d'intégration — SendersTable (identités autorisées des canaux agent)
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, test } from 'vitest';

import { env } from '@/config/env';
import { agentChannelsHandlers } from '@/testing/mocks/handlers/agent-channels';
import { server } from '@/testing/mocks/server';

import { SendersTable } from '../senders-table';

function renderTable() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <SendersTable />
    </QueryClientProvider>,
  );
}

describe('SendersTable', () => {
  test('rend les identités autorisées avec leurs droits', async () => {
    server.use(...agentChannelsHandlers);
    renderTable();

    expect(await screen.findByText('+221770000001')).toBeInTheDocument();
    expect(screen.getByText('superuser@guiss.sn')).toBeInTheDocument();
    expect(
      screen.getByRole('switch', { name: /discussion pour \+221770000001/i }),
    ).toBeChecked();
    expect(
      screen.getByRole('switch', {
        name: /actions sensibles pour \+221770000001/i,
      }),
    ).not.toBeChecked();
  });

  test('état vide : invite à ajouter une identité', async () => {
    server.use(
      http.get(`${env.API_URL}/agent-channels/senders/`, () =>
        HttpResponse.json([]),
      ),
    );
    renderTable();

    expect(
      await screen.findByText(/aucune identité autorisée/i),
    ).toBeInTheDocument();
  });
});
