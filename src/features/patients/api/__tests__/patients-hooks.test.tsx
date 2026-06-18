/**
 * Tests d'intégration — hooks API patients
 *
 * Couvre :
 * - usePatients : liste paginée, filtre is_driver: false, filtre search
 * - usePatient  : récupération d'un patient par id
 * - useCreatePatient : création avec phone_number optionnel
 * - useDeletePatient : soft-delete
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, test, vi } from 'vitest';

import { patientsHandlers } from '@/testing/mocks/handlers/patients';
import { server } from '@/testing/mocks/server';

// next-auth / next-auth/react génèrent des appels réseau non gérés dans jsdom
vi.mock('next-auth/react', async () => {
  const actual =
    await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return {
    ...actual,
    getSession: vi.fn().mockResolvedValue(null),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
});

import { useCreatePatient } from '../create-patient';
import { useDeletePatient } from '../delete-patient';
import { usePatient } from '../get-patient';
import { usePatients } from '../get-patients';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

// ─── usePatients ──────────────────────────────────────────────────────────────

describe('usePatients', () => {
  test('returns paginated list on success', async () => {
    server.use(...patientsHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePatients(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // 3 patients total dans les fixtures (2 adultes + 1 enfant)
    expect(result.current.data?.results.length).toBeGreaterThanOrEqual(2);
  });

  test('filtre is_driver: false exclut les conducteurs', async () => {
    server.use(...patientsHandlers);
    let capturedUrl = '';
    server.use(
      http.get('http://localhost:8000/depistage/patients/', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({
          count: 2,
          next: null,
          previous: null,
          results: [],
        });
      }),
    );

    const wrapper = createWrapper();
    renderHook(() => usePatients({ params: { is_driver: false } }), {
      wrapper,
    });

    await waitFor(() => expect(capturedUrl).toContain('is_driver=false'));
  });

  test("transmet le paramètre search à l'API", async () => {
    server.use(...patientsHandlers);
    let capturedUrl = '';
    server.use(
      http.get('http://localhost:8000/depistage/patients/', ({ request }) => {
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
    renderHook(() => usePatients({ params: { search: 'Diallo' } }), {
      wrapper,
    });

    await waitFor(() => expect(capturedUrl).toContain('search=Diallo'));
  });

  test("retourne une erreur quand l'API échoue", async () => {
    server.use(
      http.get('http://localhost:8000/depistage/patients/', () =>
        HttpResponse.error(),
      ),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => usePatients(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  test('démarre en état loading', () => {
    server.use(...patientsHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePatients(), { wrapper });
    expect(result.current.isLoading).toBe(true);
  });

  test('la réponse inclut count, next, previous et results', async () => {
    server.use(...patientsHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePatients(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toMatchObject({
      count: expect.any(Number),
      next: null,
      previous: null,
      results: expect.any(Array),
    });
  });
});

// ─── usePatient ───────────────────────────────────────────────────────────────

describe('usePatient', () => {
  test('retourne un patient par son id', async () => {
    server.use(...patientsHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePatient({ id: 1 }), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.full_name).toBe('Aminata Diallo');
    expect(result.current.data?.numero_identifiant).toBe('PAT-2026-001');
  });

  test('retourne une erreur 404 pour un id inconnu', async () => {
    server.use(...patientsHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePatient({ id: 9999 }), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  test('ne lance pas de requête quand id vaut 0', () => {
    server.use(...patientsHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(() => usePatient({ id: 0 }), { wrapper });
    // enabled: !!id → false pour id=0, reste idle
    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe('idle');
  });
});

// ─── useCreatePatient ─────────────────────────────────────────────────────────

describe('useCreatePatient', () => {
  test('crée un patient et appelle onSuccess', async () => {
    server.use(...patientsHandlers);
    const onSuccess = vi.fn();
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useCreatePatient({ mutationConfig: { onSuccess } }),
      { wrapper },
    );

    result.current.mutate({
      last_name: 'Fall',
      name: 'Ibrahima',
      date_de_naissance: '2000-01-01',
      sex: 'H',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onSuccess.mock.calls[0][0].full_name).toBe('Ibrahima Fall');
  });

  test('crée un patient sans phone_number (champ optionnel)', async () => {
    server.use(...patientsHandlers);
    const onSuccess = vi.fn();
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useCreatePatient({ mutationConfig: { onSuccess } }),
      { wrapper },
    );

    result.current.mutate({
      last_name: 'Sarr',
      name: 'Coumba',
      date_de_naissance: '1998-08-15',
      sex: 'F',
      // phone_number absent — doit fonctionner sans erreur
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  test('crée un patient avec phone_number vide (règle métier optionnel)', async () => {
    server.use(...patientsHandlers);

    let capturedBody: unknown = null;
    server.use(
      http.post(
        'http://localhost:8000/depistage/patients/create/',
        async ({ request }) => {
          capturedBody = await request.json();
          return HttpResponse.json(
            {
              id: 55,
              numero_identifiant: 'PAT-TEST',
              last_name: 'Test',
              name: 'Patient',
              full_name: 'Patient Test',
              date_de_naissance: '2000-01-01',
              age: 26,
              sex: 'H',
              is_adult: true,
              phone_number: null,
              created: new Date().toISOString(),
              modified: new Date().toISOString(),
            },
            { status: 201 },
          );
        },
      ),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreatePatient(), { wrapper });

    result.current.mutate({
      last_name: 'Test',
      name: 'Patient',
      date_de_naissance: '2000-01-01',
      sex: 'H',
      // phone_number omis → undefined → le composant l'envoie comme undefined
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    // Le backend reçoit la payload sans phone_number obligatoire
    expect(capturedBody).toBeTruthy();
  });

  test("entre en état error quand l'API retourne 500", async () => {
    server.use(
      http.post(
        'http://localhost:8000/depistage/patients/create/',
        () => new HttpResponse(null, { status: 500 }),
      ),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreatePatient(), { wrapper });

    result.current.mutate({
      last_name: 'Erreur',
      name: 'Test',
      date_de_naissance: '2000-01-01',
      sex: 'H',
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ─── useDeletePatient ─────────────────────────────────────────────────────────

describe('useDeletePatient', () => {
  test('soft-delete réussit et appelle onSuccess', async () => {
    server.use(...patientsHandlers);
    const onSuccess = vi.fn();
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useDeletePatient({ mutationConfig: { onSuccess } }),
      { wrapper },
    );

    result.current.mutate(1);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  test("appelle l'endpoint correct DELETE /depistage/patients/:id/delete/", async () => {
    server.use(...patientsHandlers);
    let capturedUrl = '';
    server.use(
      http.delete(
        'http://localhost:8000/depistage/patients/:id/delete/',
        ({ request }) => {
          capturedUrl = request.url;
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeletePatient(), { wrapper });

    result.current.mutate(7);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedUrl).toContain('/depistage/patients/7/delete/');
  });

  test("entre en état error si l'API retourne 500", async () => {
    server.use(
      http.delete(
        'http://localhost:8000/depistage/patients/:id/delete/',
        () => new HttpResponse(null, { status: 500 }),
      ),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeletePatient(), { wrapper });

    result.current.mutate(1);

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
