import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, test, vi } from 'vitest';

import { server } from '@/testing/mocks/server';

// Suppress next-auth telemetry fetch that causes URLSearchParams errors in jsdom
vi.mock('next-auth/react', async () => {
  const actual =
    await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return {
    ...actual,
    getSession: vi.fn().mockResolvedValue(null),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
});

import { useNotifications } from '../get-notifications';
import { useUnreadCount } from '../get-unread-count';
import { useMarkAllRead } from '../mark-all-read';
import { useMarkRead } from '../mark-read';

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

// ─── useUnreadCount ───────────────────────────────────────────────────────────

describe('useUnreadCount', () => {
  test('returns the unread notification count on success', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUnreadCount(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.count).toBe(2);
  });

  test('starts in a loading state', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUnreadCount(), { wrapper });
    expect(result.current.isLoading).toBe(true);
  });

  test('returns an error state when the API fails', async () => {
    server.use(
      http.get('http://localhost:8000/api/v1/notifications/unread-count/', () =>
        HttpResponse.error(),
      ),
    );
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUnreadCount(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ─── useNotifications ─────────────────────────────────────────────────────────

describe('useNotifications', () => {
  test('returns the paginated notifications list on success', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useNotifications(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.results).toHaveLength(3);
    expect(result.current.data?.count).toBe(3);
  });

  test('passes is_read filter in the URL query string', async () => {
    let capturedUrl = '';
    server.use(
      http.get('http://localhost:8000/api/v1/notifications/', ({ request }) => {
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
    const { result } = renderHook(
      () => useNotifications({ params: { is_read: false, limit: 10 } }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedUrl).toContain('is_read=false');
    expect(capturedUrl).toContain('limit=10');
  });

  test('does not fetch when enabled is false', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useNotifications({ enabled: false }), {
      wrapper,
    });
    // When disabled, React Query never enters a loading state
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  test('returns an error when the API fails', async () => {
    server.use(
      http.get('http://localhost:8000/api/v1/notifications/', () =>
        HttpResponse.error(),
      ),
    );
    const wrapper = createWrapper();
    const { result } = renderHook(() => useNotifications(), { wrapper });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ─── useMarkRead ──────────────────────────────────────────────────────────────

describe('useMarkRead', () => {
  test('posts to the correct notification read endpoint', async () => {
    let capturedUrl = '';
    server.use(
      http.post(
        'http://localhost:8000/api/v1/notifications/:id/read/',
        ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({ detail: 'Marked as read.' });
        },
      ),
    );

    const onSuccess = vi.fn();
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useMarkRead({ mutationConfig: { onSuccess } }),
      { wrapper },
    );

    result.current.mutate(1);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedUrl).toContain('/api/v1/notifications/1/read/');
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  test('enters an error state when the API returns a 500', async () => {
    server.use(
      http.post(
        'http://localhost:8000/api/v1/notifications/:id/read/',
        () => new HttpResponse(null, { status: 500 }),
      ),
    );
    const wrapper = createWrapper();
    const { result } = renderHook(() => useMarkRead(), { wrapper });

    result.current.mutate(1);

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ─── useMarkAllRead ───────────────────────────────────────────────────────────

describe('useMarkAllRead', () => {
  test('posts to the read-all endpoint and invokes onSuccess callback', async () => {
    const onSuccess = vi.fn();
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useMarkAllRead({ mutationConfig: { onSuccess } }),
      { wrapper },
    );

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  test('calls the read-all endpoint (not the per-notification endpoint)', async () => {
    let capturedUrl = '';
    server.use(
      http.post(
        'http://localhost:8000/api/v1/notifications/read-all/',
        ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({ detail: 'All marked.', count: 2 });
        },
      ),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useMarkAllRead(), { wrapper });

    result.current.mutate();

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedUrl).toContain('/api/v1/notifications/read-all/');
  });
});
