/**
 * Tests d'intégration — AssistantChat (fil persistant)
 *
 * Couvre :
 * - Conversation existante : le fil persisté (MSW) est rendu au montage
 * - Envoi dans une conversation existante : bulle optimiste puis réponse
 *   réconciliée dans le cache (sources lisibles incluses)
 * - Nouvelle conversation : premier succès → redirection vers /assistant-ia/42
 * - Conversation étrangère/inexistante (404) : état « introuvable »
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import { aiReportsHandlers } from '@/testing/mocks/handlers/ai-reports';
import { server } from '@/testing/mocks/server';

const replaceMock = vi.fn();

vi.mock('next/navigation', async () => {
  const actual =
    await vi.importActual<typeof import('next/navigation')>('next/navigation');
  return {
    ...actual,
    useRouter: () => ({ push: vi.fn(), replace: replaceMock }),
    usePathname: () => '/assistant-ia',
  };
});

// Évite les appels next-auth asynchrones (getSession) dans jsdom
vi.mock('next-auth/react', async () => {
  const actual =
    await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return {
    ...actual,
    getSession: vi.fn().mockResolvedValue(null),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
});

import { AssistantChat } from '../assistant-chat';

function renderChat(conversationId?: number) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <AssistantChat conversationId={conversationId} />
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  replaceMock.mockClear();
  server.use(...aiReportsHandlers);
});

describe('AssistantChat', () => {
  test('rend le fil persisté d’une conversation existante', async () => {
    renderChat(42);

    expect(
      await screen.findByText('Combien de patients ce mois-ci ?'),
    ).toBeInTheDocument();
    expect(screen.getByText('55 examens')).toBeInTheDocument();
  });

  test('affiche « introuvable » sur une conversation inconnue (404)', async () => {
    renderChat(999);

    expect(
      await screen.findByText(/conversation introuvable/i),
    ).toBeInTheDocument();
  });

  test('envoi dans une conversation existante : bulle optimiste puis réponse', async () => {
    renderChat(42);

    await screen.findByText('Combien de patients ce mois-ci ?');

    const textbox = screen.getByRole('textbox', { name: /question/i });
    await userEvent.type(textbox, 'Et pour les femmes ?');
    await userEvent.click(screen.getByRole('button', { name: /envoyer/i }));

    // Bulle user optimiste immédiate (avant la réponse du serveur)
    expect(screen.getByText('Et pour les femmes ?')).toBeInTheDocument();

    // Réponse réconciliée dans le cache (contenu de mockAskResponse)
    await waitFor(() =>
      expect(screen.getAllByText('55 examens').length).toBeGreaterThanOrEqual(
        2,
      ),
    );
    // Pas de redirection : on reste dans le même fil
    expect(replaceMock).not.toHaveBeenCalled();
  });

  test('nouvelle conversation : le premier succès redirige vers le fil créé', async () => {
    renderChat();

    // État vide de la nouvelle conversation
    expect(
      screen.getByText(/posez une question analytique/i),
    ).toBeInTheDocument();

    const textbox = screen.getByRole('textbox', { name: /question/i });
    await userEvent.type(textbox, 'Combien de patients ce mois-ci ?');
    await userEvent.click(screen.getByRole('button', { name: /envoyer/i }));

    await waitFor(() =>
      expect(replaceMock).toHaveBeenCalledWith('/assistant-ia/42'),
    );
  });
});
