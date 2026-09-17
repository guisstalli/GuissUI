import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { describe, expect, test, vi } from 'vitest';

import { env } from '@/config/env';
import { server } from '@/testing/mocks/server';
import { rtlRender, screen, userEvent } from '@/testing/test-utils';

import { ConversationList } from '../conversation-list';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
}));

vi.mock('next-auth/react', async () => {
  const actual =
    await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return { ...actual, getSession: vi.fn().mockResolvedValue(null) };
});

/**
 * L'historique s'allonge à chaque question : retrouver « le rapport de la gare
 * routière » demandait de faire défiler des dizaines d'entrées tronquées.
 */
const conversations = [
  {
    id: 1,
    title: 'Rapport de la gare routière',
    updated_at: '2026-09-01T10:00:00Z',
  },
  {
    id: 2,
    title: 'Acuité visuelle des enfants',
    updated_at: '2026-09-02T10:00:00Z',
  },
];

function rendre() {
  server.use(
    http.get(`${env.API_URL}/ai-reports/conversations/`, () =>
      HttpResponse.json({ count: 2, results: conversations }),
    ),
  );
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  rtlRender(
    <QueryClientProvider client={client}>
      <ConversationList activeConversationId={undefined} />
    </QueryClientProvider>,
  );
}

describe('Rechercher dans l’historique', () => {
  test('la saisie filtre les conversations affichées', async () => {
    rendre();
    const user = userEvent.setup();
    await screen.findByText('Rapport de la gare routière');

    await user.type(
      screen.getByLabelText('Rechercher une conversation'),
      'gare',
    );

    expect(screen.getByText('Rapport de la gare routière')).toBeInTheDocument();
    expect(
      screen.queryByText('Acuité visuelle des enfants'),
    ).not.toBeInTheDocument();
  });

  test('une recherche sans résultat le dit', async () => {
    rendre();
    const user = userEvent.setup();
    await screen.findByText('Rapport de la gare routière');

    await user.type(
      screen.getByLabelText('Rechercher une conversation'),
      'pachymétrie',
    );

    expect(
      screen.getByText(/Aucune conversation ne correspond/),
    ).toBeInTheDocument();
  });

  test('vider la recherche ramène tout l’historique', async () => {
    rendre();
    const user = userEvent.setup();
    await screen.findByText('Rapport de la gare routière');
    const champ = screen.getByLabelText('Rechercher une conversation');

    await user.type(champ, 'gare');
    await user.clear(champ);

    expect(screen.getByText('Acuité visuelle des enfants')).toBeInTheDocument();
  });
});
