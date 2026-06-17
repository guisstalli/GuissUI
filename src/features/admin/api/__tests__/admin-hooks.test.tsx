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

// Register admin MSW handlers for these tests
import { adminHandlers } from '@/testing/mocks/handlers/admin';

// Activate the admin handlers before each test because setup-tests.ts calls
// server.resetHandlers() in afterEach, which would remove them after the first test.
beforeEach(() => {
  server.use(...adminHandlers);
});

import { useUsers } from '../get-users';
import { useCreateUser } from '../create-user';
import { useDeleteUser } from '../delete-user';
import { useToggleActive } from '../toggle-active';
import { useAuditLog } from '../get-audit-log';

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

// ─── useUsers ─────────────────────────────────────────────────────────────────

describe('useUsers', () => {
  test('returns the paginated user list on success', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUsers(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.results).toHaveLength(3);
    expect(result.current.data?.count).toBe(3);
  });

  test('starts in a loading state', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUsers(), { wrapper });
    expect(result.current.isLoading).toBe(true);
  });

  test('filters users by email when the email param is provided', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useUsers({ email: 'alice@guiss.sn' }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.results).toHaveLength(1);
    expect(result.current.data?.results[0].email).toBe('alice@guiss.sn');
  });

  test('filters users by role when the role param is provided', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUsers({ role: 'STAFF' }), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.results).toHaveLength(1);
    expect(result.current.data?.results[0].role).toBe('STAFF');
  });

  test('filters users by is_active when the param is provided', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useUsers({ is_active: false }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.results).toHaveLength(1);
    expect(result.current.data?.results[0].is_active).toBe(false);
  });

  test('sends email param in the URL query string', async () => {
    let capturedUrl = '';
    server.use(
      http.get('http://localhost:8000/users/', ({ request }) => {
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
      () => useUsers({ email: 'test@guiss.sn' }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedUrl).toContain('email=test%40guiss.sn');
  });

  test('returns an error when the API fails', async () => {
    server.use(
      http.get('http://localhost:8000/users/', () => HttpResponse.error()),
    );
    const wrapper = createWrapper();
    const { result } = renderHook(() => useUsers(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  test('returns an empty list when no users match the filter', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useUsers({ email: 'nobody@nowhere.com' }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.results).toHaveLength(0);
    expect(result.current.data?.count).toBe(0);
  });
});

// ─── useCreateUser ────────────────────────────────────────────────────────────

describe('useCreateUser', () => {
  test('calls the POST endpoint and invokes onSuccess callback', async () => {
    const onSuccess = vi.fn();
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateUser({ onSuccess }), {
      wrapper,
    });

    result.current.mutate({
      email: 'new@guiss.sn',
      phone_number: '+221 77 999 00 01',
      role: 'DOCTEUR',
      first_name: 'Fatou',
      last_name: 'Diallo',
      title: 'MRS',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  test('enters an error state when the API returns a 400', async () => {
    server.use(
      http.post(
        'http://localhost:8000/users/admin/create/',
        () =>
          HttpResponse.json(
            { email: ['This email already exists.'] },
            { status: 400 },
          ),
      ),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateUser(), { wrapper });

    result.current.mutate({
      email: 'alice@guiss.sn',
      phone_number: '+221 77 000 00 01',
      role: 'STAFF',
      first_name: 'Alice',
      last_name: 'Dupont',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  test('posts to the correct endpoint URL', async () => {
    let capturedUrl = '';
    server.use(
      http.post(
        'http://localhost:8000/users/admin/create/',
        ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({ id: 10 }, { status: 201 });
        },
      ),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateUser(), { wrapper });

    result.current.mutate({
      email: 'x@y.com',
      phone_number: '12345678',
      role: 'STAFF',
      first_name: 'X',
      last_name: 'Y',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedUrl).toContain('/users/admin/create/');
  });
});

// ─── useDeleteUser ────────────────────────────────────────────────────────────

describe('useDeleteUser', () => {
  test('calls the DELETE endpoint and invokes onSuccess callback', async () => {
    const onSuccess = vi.fn();
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteUser({ onSuccess }), {
      wrapper,
    });

    result.current.mutate(1);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  test('calls the correct endpoint URL', async () => {
    let capturedUrl = '';
    server.use(
      http.delete(
        'http://localhost:8000/users/:id/delete/',
        ({ request }) => {
          capturedUrl = request.url;
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteUser(), { wrapper });

    result.current.mutate(2);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedUrl).toContain('/users/2/delete/');
  });

  test('enters an error state when the API returns a 404', async () => {
    server.use(
      http.delete(
        'http://localhost:8000/users/:id/delete/',
        () =>
          HttpResponse.json({ detail: 'Not found.' }, { status: 404 }),
      ),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteUser(), { wrapper });

    result.current.mutate(9999);

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ─── useToggleActive ──────────────────────────────────────────────────────────

describe('useToggleActive', () => {
  test('patches the user active status and invokes onSuccess', async () => {
    const onSuccess = vi.fn();
    const wrapper = createWrapper();
    const { result } = renderHook(() => useToggleActive({ onSuccess }), {
      wrapper,
    });

    result.current.mutate({ id: 1, is_active: false });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  test('calls the correct endpoint URL with the user id', async () => {
    let capturedUrl = '';
    server.use(
      http.patch(
        'http://localhost:8000/users/:id/toggle-active/',
        ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({ id: 3, is_active: true });
        },
      ),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useToggleActive(), { wrapper });

    result.current.mutate({ id: 3, is_active: true });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedUrl).toContain('/users/3/toggle-active/');
  });

  test('sends the is_active value in the request body', async () => {
    let capturedBody: Record<string, unknown> | null = null;
    server.use(
      http.patch(
        'http://localhost:8000/users/:id/toggle-active/',
        async ({ request }) => {
          capturedBody = (await request.json()) as Record<string, unknown>;
          return HttpResponse.json({ id: 2, is_active: false });
        },
      ),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useToggleActive(), { wrapper });

    result.current.mutate({ id: 2, is_active: false });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect((capturedBody as Record<string, unknown> | null)?.is_active).toBe(false);
  });
});

// ─── useAuditLog ──────────────────────────────────────────────────────────────

describe('useAuditLog', () => {
  test('returns the audit log entries for a user', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuditLog(1), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].event).toBe('USER_LOGIN');
  });

  test('does not fetch when userId is 0', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuditLog(0), { wrapper });
    // enabled: userId > 0 means it never starts loading
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBeUndefined();
  });

  test('returns an error when the API fails', async () => {
    server.use(
      http.get(
        'http://localhost:8000/users/:id/audit-log/',
        () => HttpResponse.error(),
      ),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuditLog(1), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  test('calls the correct endpoint URL', async () => {
    let capturedUrl = '';
    server.use(
      http.get(
        'http://localhost:8000/users/:id/audit-log/',
        ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json([]);
        },
      ),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useAuditLog(42), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedUrl).toContain('/users/42/audit-log/');
  });
});
