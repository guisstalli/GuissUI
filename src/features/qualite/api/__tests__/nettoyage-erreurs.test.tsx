import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import React from 'react';
import { beforeEach, describe, expect, it } from 'vitest';

import { useNotifications } from '@/components/ui/notifications';
import { env } from '@/config/env';
import { server } from '@/testing/mocks/server';

import { useRestaurerNettoyage } from '../nettoyage';

function wrapper({ children }: { children: React.ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

const erreurs = () =>
  useNotifications.getState().notifications.filter((n) => n.type === 'error');

describe('useRestaurerNettoyage — refus du serveur', () => {
  beforeEach(() => useNotifications.setState({ notifications: [] }));

  it.each([404, 409])(
    'un refus %i affiche UN seul message, celui du serveur',
    async (statut) => {
      // Staging, 17/09/2026 : « Non trouvé » ET « Restauration impossible »
      // s'empilaient pour la même archive introuvable.
      const detail = 'Archive introuvable : /tmp/x.json.';
      server.use(
        http.post(
          `${env.API_URL}/analytics/qualite/nettoyage/:id/restaurer/`,
          () => HttpResponse.json({ detail }, { status: statut }),
        ),
      );
      const { result } = renderHook(() => useRestaurerNettoyage(), { wrapper });

      act(() => result.current.mutate(1));
      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(erreurs()).toHaveLength(1);
      expect(erreurs()[0].title).toBe('Restauration impossible');
      expect(erreurs()[0].message).toBe(detail);
    },
  );
});
