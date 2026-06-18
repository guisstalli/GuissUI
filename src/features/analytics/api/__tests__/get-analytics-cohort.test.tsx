import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import type { ReactNode } from 'react';
import { describe, expect, test, vi } from 'vitest';

import { env } from '@/config/env';
import { mockCohortResponse } from '@/testing/mocks/handlers/analytics';
import { server } from '@/testing/mocks/server';

// Prevent next-auth from firing async fetch calls that error in jsdom
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
import { useAnalyticsCohort } from '../get-analytics-cohort';

const COHORT_URL = `${env.API_URL}/analytics/cohort/`;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useAnalyticsCohort', () => {
  test('returns the parsed cohort response on success', async () => {
    server.use(
      http.get(COHORT_URL, () => HttpResponse.json(mockCohortResponse)),
    );
    const { result } = renderHook(
      () =>
        useAnalyticsCohort({
          filters: { ...DEFAULT_ANALYTICS_FILTERS, acuity: 'malvoyance' },
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.count).toBe(3);
    expect(result.current.data?.results).toHaveLength(3);
    expect(result.current.data?.summary.severity).toBe('high');
    expect(result.current.data?.results[2].last_exam_date).toBeNull();
  });

  test('does not fetch when enabled is false', () => {
    server.use(
      http.get(COHORT_URL, () => HttpResponse.json(mockCohortResponse)),
    );
    const { result } = renderHook(
      () =>
        useAnalyticsCohort({
          filters: { ...DEFAULT_ANALYTICS_FILTERS, acuity: 'malvoyance' },
          enabled: false,
        }),
      { wrapper: createWrapper() },
    );

    expect(result.current.isFetching).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  test('builds the URL with the clinical criterion', async () => {
    let capturedUrl = '';
    server.use(
      http.get(COHORT_URL, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(mockCohortResponse);
      }),
    );

    const { result } = renderHook(
      () =>
        useAnalyticsCohort({
          filters: {
            ...DEFAULT_ANALYTICS_FILTERS,
            tension: 'hypertonie_moderee',
          },
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedUrl).toContain('tension=hypertonie_moderee');
  });

  test('appends site_id and patient_ids as repeatable params', async () => {
    let capturedUrl = '';
    server.use(
      http.get(COHORT_URL, ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json(mockCohortResponse);
      }),
    );

    const { result } = renderHook(
      () =>
        useAnalyticsCohort({
          filters: {
            ...DEFAULT_ANALYTICS_FILTERS,
            acuity: 'malvoyance',
            site_id: [1, 2],
            patient_ids: [10, 20, 30],
          },
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    const url = new URL(capturedUrl);
    expect(url.searchParams.getAll('site_id')).toEqual(['1', '2']);
    expect(url.searchParams.getAll('patient_ids')).toEqual(['10', '20', '30']);
  });

  test('returns an error when the API fails', async () => {
    server.use(http.get(COHORT_URL, () => HttpResponse.error()));
    const { result } = renderHook(
      () =>
        useAnalyticsCohort({
          filters: { ...DEFAULT_ANALYTICS_FILTERS, acuity: 'malvoyance' },
        }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
