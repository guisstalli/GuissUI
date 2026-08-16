/**
 * Tests d'intégration — hooks API conversations (MSW)
 *
 * Couvre :
 * - useConversations : liste paginée (sidebar)
 * - useConversation : détail avec messages ordonnés ; 404 → erreur
 * - useRenameConversation : PATCH + invalidation de la liste
 * - useDeleteConversation : DELETE 204
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

import { aiReportsHandlers } from '@/testing/mocks/handlers/ai-reports';
import { server } from '@/testing/mocks/server';

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

import { useDeleteConversation } from '../delete-conversation';
import { useConversation } from '../get-conversation';
import { useConversations } from '../get-conversations';
import { useRenameConversation } from '../rename-conversation';

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

describe('useConversations', () => {
  test('retourne la liste paginée des conversations', async () => {
    server.use(...aiReportsHandlers);
    const { result } = renderHook(() => useConversations(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.count).toBe(1);
    expect(result.current.data?.results[0].title).toBe(
      'Combien de patients ce mois-ci ?',
    );
    expect(result.current.data?.results[0].message_count).toBe(2);
  });
});

describe('useConversation', () => {
  test('retourne le fil complet ordonné', async () => {
    server.use(...aiReportsHandlers);
    const { result } = renderHook(() => useConversation(42), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.messages).toHaveLength(2);
    expect(result.current.data?.messages[0].role).toBe('USER');
    expect(result.current.data?.messages[1].role).toBe('ASSISTANT');
    expect(result.current.data?.messages[1].sources_display?.[0].label).toBe(
      "Vue d'ensemble de la cohorte",
    );
  });

  test('bascule en erreur sur une conversation inconnue (404)', async () => {
    server.use(...aiReportsHandlers);
    const { result } = renderHook(() => useConversation(999), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useRenameConversation', () => {
  test('renomme et retourne le nouveau titre', async () => {
    server.use(...aiReportsHandlers);
    const { result } = renderHook(() => useRenameConversation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate({ conversationId: 42, title: 'Suivi glaucome' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.title).toBe('Suivi glaucome');
  });
});

describe('useDeleteConversation', () => {
  test('supprime la conversation (204)', async () => {
    server.use(...aiReportsHandlers);
    const { result } = renderHook(() => useDeleteConversation(), {
      wrapper: createWrapper(),
    });

    result.current.mutate(42);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
