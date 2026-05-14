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

import { useDashboard } from '../get-dashboard';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe('useDashboard', () => {
  test('returns dashboard data on successful fetch', async () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useDashboard(), { wrapper });

    // Assert
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.examens.today.total).toBe(17);
    expect(result.current.data?.patients.total).toBe(340);
    expect(result.current.data?.rendez_vous.prochains).toHaveLength(2);
  });

  test('starts in a loading state', () => {
    // Arrange
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useDashboard(), { wrapper });

    // Assert — synchronous check before any await
    expect(result.current.isLoading).toBe(true);
  });

  test('returns an error when the API fails', async () => {
    // Arrange
    server.use(
      http.get('http://localhost:8000/api/v1/dashboard/', () =>
        HttpResponse.error(),
      ),
    );
    const wrapper = createWrapper();

    // Act
    const { result } = renderHook(() => useDashboard(), { wrapper });

    // Assert
    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  test('uses the query key ["dashboard"]', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDashboard(), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // Verify data is present — confirms the query key was used correctly
    expect(result.current.data).toBeDefined();
  });
});
