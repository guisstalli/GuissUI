import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, test, vi } from 'vitest';

import {
  analyticsHandlers,
  mockAnalyticsOverview,
  mockAnalyticsSites,
} from '@/testing/mocks/handlers/analytics';
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

import { DEFAULT_ANALYTICS_FILTERS } from '../../types/types';
import { useAnalyticsOverview } from '../get-analytics-overview';
import { useAnalyticsSites } from '../get-analytics-sites';

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

// ─── useAnalyticsOverview ────────────────────────────────────────────────────

describe('useAnalyticsOverview', () => {
  test('returns overview data on success', async () => {
    server.use(...analyticsHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useAnalyticsOverview({ filters: DEFAULT_ANALYTICS_FILTERS }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.population.patients_total).toBe(245);
    expect(result.current.data?.population.examens_total).toBe(312);
    expect(result.current.data?.population.age_mean).toBe(38.5);
  });

  test('starts in a loading state', () => {
    server.use(...analyticsHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useAnalyticsOverview({ filters: DEFAULT_ANALYTICS_FILTERS }),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(true);
  });

  test('returns an error when the API fails', async () => {
    server.use(
      http.get('http://localhost:8000/analytics/overview/', () =>
        HttpResponse.error(),
      ),
    );
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useAnalyticsOverview({ filters: DEFAULT_ANALYTICS_FILTERS }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  test('does not fetch when enabled is false', () => {
    server.use(...analyticsHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(
      () =>
        useAnalyticsOverview({
          filters: DEFAULT_ANALYTICS_FILTERS,
          enabled: false,
        }),
      { wrapper },
    );

    // When disabled, the query stays in idle state (not loading)
    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  test('sex_distribution contains expected keys', async () => {
    server.use(...analyticsHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useAnalyticsOverview({ filters: DEFAULT_ANALYTICS_FILTERS }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.population.sex_distribution).toMatchObject({
      H: 140,
      F: 100,
      A: 5,
    });
  });
});

// ─── useAnalyticsSites ────────────────────────────────────────────────────────

describe('useAnalyticsSites', () => {
  test('returns sites analytics data on success', async () => {
    server.use(...analyticsHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useAnalyticsSites({ filters: DEFAULT_ANALYTICS_FILTERS }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.sites).toHaveLength(3);
    expect(result.current.data?.sites[0].site_libelle).toBe('Dakar - Plateau');
  });

  test('starts in a loading state', () => {
    server.use(...analyticsHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useAnalyticsSites({ filters: DEFAULT_ANALYTICS_FILTERS }),
      { wrapper },
    );

    expect(result.current.isLoading).toBe(true);
  });

  test('returns an error when the API fails', async () => {
    server.use(
      http.get('http://localhost:8000/analytics/sites/', () =>
        HttpResponse.error(),
      ),
    );
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useAnalyticsSites({ filters: DEFAULT_ANALYTICS_FILTERS }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  test('does not fetch when enabled is false', () => {
    server.use(...analyticsHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(
      () =>
        useAnalyticsSites({
          filters: DEFAULT_ANALYTICS_FILTERS,
          enabled: false,
        }),
      { wrapper },
    );

    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  test('site item has expected shape with nullable av_mean', async () => {
    server.use(...analyticsHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useAnalyticsSites({ filters: DEFAULT_ANALYTICS_FILTERS }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Ziguinchor has null av_mean and to_mean
    const ziguinchor = result.current.data?.sites.find(
      (s) => s.site_libelle === 'Ziguinchor',
    );
    expect(ziguinchor?.av_mean).toBeNull();
    expect(ziguinchor?.to_mean).toBeNull();
    expect(ziguinchor?.examens_total).toBe(52);
  });

  test('passes filter params in the request URL', async () => {
    let capturedUrl = '';
    server.use(
      http.get('http://localhost:8000/analytics/sites/', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(mockAnalyticsSites);
      }),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(
      () =>
        useAnalyticsSites({
          filters: {
            ...DEFAULT_ANALYTICS_FILTERS,
            date_start: '2024-01-01',
            date_end: '2024-12-31',
          },
        }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedUrl).toContain('date_start=2024-01-01');
    expect(capturedUrl).toContain('date_end=2024-12-31');
  });
});
