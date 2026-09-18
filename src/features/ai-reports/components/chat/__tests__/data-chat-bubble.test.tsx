/**
 * Tests d'intégration — bulle de discussion des pages analytiques.
 *
 * Une question posée depuis un tableau de bord porte sur ce qui est affiché.
 * Ces tests vérifient les deux choses qui rendent la bulle honnête : le
 * périmètre part RÉELLEMENT avec la question, et ce qui ne peut pas être
 * transmis est dit au lieu d'être tu.
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HttpResponse, http } from 'msw';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { env } from '@/config/env';
import { aiReportsHandlers } from '@/testing/mocks/handlers/ai-reports';
import { server } from '@/testing/mocks/server';
import { render, screen, userEvent, waitFor } from '@/testing/test-utils';

vi.mock('next-auth/react', async () => {
  const actual =
    await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return {
    ...actual,
    getSession: vi.fn().mockResolvedValue(null),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
});

// `Can` interroge les capacités du serveur : la bulle n'est rendue que pour
// qui a accès au chat. Ici on teste la bulle, pas le contrôle d'accès.
vi.mock('@/components/ui/can', () => ({
  Can: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import { DataChatBubble } from '../data-chat-bubble';

const FILTRES = {
  date_start: '2026-01-01',
  date_end: '2026-06-30',
  site_id: [9],
  sex: 'F',
  exam_type: 'all',
};

function monter(filtres: Record<string, unknown> = FILTRES) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <DataChatBubble
        filters={filtres}
        siteNames={new Map([[9, 'Centre Dakar']])}
      />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  server.use(...aiReportsHandlers);
});

describe('Bulle de discussion des données', () => {
  test('repliée, elle propose simplement de discuter', () => {
    monter();

    expect(
      screen.getByRole('button', {
        name: /Discuter de ces données avec l'assistant/i,
      }),
    ).toBeInTheDocument();
  });

  test('ouverte, elle annonce le périmètre en clair', async () => {
    const user = userEvent.setup();
    monter();

    await user.click(
      screen.getByRole('button', {
        name: /Discuter de ces données avec l'assistant/i,
      }),
    );

    // Le site est nommé, pas numéroté (le nom apparaît dans le résumé
    // d'en-tête ET dans la puce du périmètre).
    expect(await screen.findAllByText(/Centre Dakar/)).not.toHaveLength(0);
    expect(screen.getAllByText(/Femmes/).length).toBeGreaterThan(0);
  });

  test('la question part avec les filtres de l’écran', async () => {
    const user = userEvent.setup();
    const envoyes: unknown[] = [];
    server.use(
      http.post(`${env.API_URL}/ai-reports/chat/`, async ({ request }) => {
        envoyes.push(await request.json());
        return HttpResponse.json({
          answer_markdown: 'Réponse.',
          tools_used: ['get_overview'],
          conversation_id: 42,
          message_id: 7,
          trajectory: [],
          artifacts: [],
          sources_display: [],
        });
      }),
    );
    monter();

    await user.click(
      screen.getByRole('button', {
        name: /Discuter de ces données avec l'assistant/i,
      }),
    );
    await user.type(
      screen.getByRole('textbox'),
      'Combien de patientes ont été vues ?',
    );
    await user.keyboard('{Enter}');

    await waitFor(() => expect(envoyes).toHaveLength(1));
    expect((envoyes[0] as { filters: unknown }).filters).toMatchObject({
      date_start: '2026-01-01',
      site_id: [9],
      sex: 'F',
    });
    expect(await screen.findByText('Réponse.')).toBeInTheDocument();
  });

  test('une restriction non transmissible est annoncée, pas tue', async () => {
    const user = userEvent.setup();
    monter({ ...FILTRES, patient_ids: [1, 2, 3] });

    await user.click(
      screen.getByRole('button', {
        name: /Discuter de ces données avec l'assistant/i,
      }),
    );

    expect(
      await screen.findByText(/ne peut pas appliquer la cohorte sélectionnée/i),
    ).toBeInTheDocument();
  });

  test('sans cohorte, aucun avertissement ne s’affiche', async () => {
    const user = userEvent.setup();
    monter();

    await user.click(
      screen.getByRole('button', {
        name: /Discuter de ces données avec l'assistant/i,
      }),
    );
    await screen.findAllByText(/Centre Dakar/);

    expect(
      screen.queryByText(/ne peut pas appliquer/i),
    ).not.toBeInTheDocument();
  });

  test('elle se referme sans perdre le bouton', async () => {
    const user = userEvent.setup();
    monter();

    await user.click(
      screen.getByRole('button', {
        name: /Discuter de ces données avec l'assistant/i,
      }),
    );
    await user.click(
      screen.getByRole('button', { name: /Fermer la discussion/i }),
    );

    expect(
      screen.getByRole('button', {
        name: /Discuter de ces données avec l'assistant/i,
      }),
    ).toBeInTheDocument();
  });
});
