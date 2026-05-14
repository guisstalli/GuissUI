import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { describe, expect, test, vi } from 'vitest';

import { server } from '@/testing/mocks/server';
import { rtlRender, screen, waitFor } from '@/testing/test-utils';

import { NotificationBell } from '../notification-bell';

// Prevent next-auth's internal logger from firing async fetch calls that
// produce URLSearchParams-body errors in jsdom.
vi.mock('next-auth/react', async () => {
  const actual =
    await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return {
    ...actual,
    getSession: vi.fn().mockResolvedValue(null),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
});

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderBell() {
  const queryClient = createQueryClient();
  return rtlRender(
    <QueryClientProvider client={queryClient}>
      <NotificationBell />
    </QueryClientProvider>,
  );
}

describe('NotificationBell', () => {
  test('renders the bell button with accessible label', async () => {
    // Arrange & Act
    renderBell();

    // Assert
    expect(
      await screen.findByRole('button', { name: /notifications/i }),
    ).toBeInTheDocument();
  });

  test('shows an unread badge when the count is greater than zero', async () => {
    // Arrange — handler in notifications.ts returns { count: 2 }
    renderBell();

    // Assert
    await waitFor(() => {
      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  test('hides the badge when unread count is zero', async () => {
    // Arrange — override handler for this test
    server.use(
      http.get('http://localhost:8000/api/v1/notifications/unread-count/', () =>
        HttpResponse.json({ count: 0 }),
      ),
    );

    renderBell();

    // Assert — badge should never appear
    await waitFor(() => {
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
  });

  test('caps the displayed badge at "99+" when count exceeds 99', async () => {
    // Arrange
    server.use(
      http.get('http://localhost:8000/api/v1/notifications/unread-count/', () =>
        HttpResponse.json({ count: 150 }),
      ),
    );

    renderBell();

    // Assert
    await waitFor(() => {
      expect(screen.getByText('99+')).toBeInTheDocument();
    });
  });

  test('shows exactly 99 when count equals 99 (no truncation)', async () => {
    server.use(
      http.get('http://localhost:8000/api/v1/notifications/unread-count/', () =>
        HttpResponse.json({ count: 99 }),
      ),
    );

    renderBell();

    await waitFor(() => {
      expect(screen.getByText('99')).toBeInTheDocument();
    });
  });
});
