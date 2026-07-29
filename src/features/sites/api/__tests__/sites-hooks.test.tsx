import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, test, vi } from 'vitest';

import { sitesHandlers } from '@/testing/mocks/handlers/sites';
import { server } from '@/testing/mocks/server';

// Prevent next-auth from firing async fetch calls that cause errors in jsdom
vi.mock('next-auth/react', async () => {
  const actual =
    await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return {
    ...actual,
    getSession: vi.fn().mockResolvedValue(null),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
});

import { useSites } from '../get-sites';
import { useHardDeleteSite } from '../hard-delete-site';
import { useReactivateSite } from '../reactivate-site';

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

describe('useSites', () => {
  test('returns the paginated sites list on success', async () => {
    server.use(...sitesHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useSites(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.count).toBe(3);
    expect(result.current.data?.results).toHaveLength(3);
    expect(result.current.data?.results[0].libelle).toBe('Dakar - Plateau');
  });

  test('starts in a loading state', () => {
    server.use(...sitesHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useSites(), { wrapper });

    expect(result.current.isLoading).toBe(true);
  });

  test('returns an error when the API fails', async () => {
    server.use(
      http.get('http://localhost:8000/depistage/sites/', () =>
        HttpResponse.error(),
      ),
    );
    const wrapper = createWrapper();
    const { result } = renderHook(() => useSites(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  test('filters sites by search param', async () => {
    server.use(...sitesHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useSites({ params: { search: 'Dakar' } }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.results.length).toBe(1);
    expect(result.current.data?.results[0].libelle).toBe('Dakar - Plateau');
  });

  test('includes limit param in the API request', async () => {
    let capturedUrl = '';
    server.use(
      http.get('http://localhost:8000/depistage/sites/', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({
          count: 0,
          next: null,
          previous: null,
          results: [],
        });
      }),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useSites({ params: { limit: 10 } }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedUrl).toContain('limit=10');
  });

  test('each site has the expected fields', async () => {
    server.use(...sitesHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useSites(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const firstSite = result.current.data?.results[0];
    expect(firstSite).toMatchObject({
      id: 1,
      libelle: 'Dakar - Plateau',
      code: 'dakar-plateau',
      is_active: true,
    });
  });
});

/**
 * Suppression définitive : le risque réel n'est pas le rendu du message — un
 * `<p>{purgeError}</p>` ne casse pas — mais le TRAJET du message. Le backend
 * refuse en 409 avec une explication ; si le client d'API l'avale et ne laisse
 * qu'un « Conflict » générique, l'utilisateur ne sait ni pourquoi ça a échoué
 * ni quoi faire. C'est ce trajet qu'on vérifie ici.
 */
describe('useHardDeleteSite', () => {
  test('remonte le motif du refus 409 jusqu’à l’appelant', async () => {
    server.use(...sitesHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useHardDeleteSite(), { wrapper });

    // Le site 1 est référencé côté handler.
    result.current.mutate({ siteId: 1 });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as Error).message).toMatch(
      /référencé par 3 examens adultes/i,
    );
  });

  test('réussit sur un site sans référence', async () => {
    server.use(...sitesHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useHardDeleteSite(), { wrapper });

    result.current.mutate({ siteId: 2 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useReactivateSite', () => {
  test('réactive un site désactivé', async () => {
    server.use(...sitesHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useReactivateSite(), { wrapper });

    // Le site 3 (Ziguinchor) est inactif dans le mock.
    result.current.mutate({ siteId: 3 });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.is_active).toBe(true);
  });
});
