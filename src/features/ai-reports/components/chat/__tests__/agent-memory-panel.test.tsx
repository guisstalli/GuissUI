import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { describe, expect, test, vi } from 'vitest';

import { env } from '@/config/env';
import { server } from '@/testing/mocks/server';
import {
  rtlRender,
  screen,
  userEvent,
  waitFor,
  within,
} from '@/testing/test-utils';

import { AgentMemoryPanel } from '../agent-memory-panel';

vi.mock('next-auth/react', async () => {
  const actual =
    await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return { ...actual, getSession: vi.fn().mockResolvedValue(null) };
});

/**
 * L'agent réinjecte ses préférences durables dans les conversations suivantes.
 * Sans cet écran, une consigne donnée un jour orientait les réponses des
 * semaines plus tard, sans qu'on puisse la retrouver ni la retirer.
 */
function rendre(notes: string[]) {
  server.use(
    http.get(`${env.API_URL}/ai-reports/memoire/`, () =>
      HttpResponse.json({ notes }),
    ),
  );
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  rtlRender(
    <QueryClientProvider client={client}>
      <AgentMemoryPanel />
    </QueryClientProvider>,
  );
}

describe('Ce que l’assistant a retenu', () => {
  test('les préférences retenues sont affichées', async () => {
    rendre(['Toujours exprimer l’acuité en dixièmes']);

    expect(
      await screen.findByText(/Toujours exprimer l’acuité en dixièmes/),
    ).toBeInTheDocument();
  });

  test('une mémoire vide n’affiche aucun bloc', async () => {
    rendre([]);

    await waitFor(() =>
      expect(
        screen.queryByText(/Ce que l’assistant a retenu/),
      ).not.toBeInTheDocument(),
    );
  });

  test('tout oublier demande confirmation avant d’effacer', async () => {
    let efface = false;
    rendre(['Une préférence']);
    server.use(
      http.delete(`${env.API_URL}/ai-reports/memoire/`, () => {
        efface = true;
        return HttpResponse.json({ effacees: 1 });
      }),
    );
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    await screen.findByText(/Une préférence/);

    await user.click(screen.getByRole('button', { name: /Tout oublier/ }));
    expect(efface).toBe(false);

    // Le bouton de CONFIRMATION est celui de la fenêtre, pas le déclencheur.
    const fenetre = await screen.findByRole('dialog');
    await user.click(
      within(fenetre).getByRole('button', { name: /^Tout oublier$/ }),
    );
    await waitFor(() => expect(efface).toBe(true));
  });
});
