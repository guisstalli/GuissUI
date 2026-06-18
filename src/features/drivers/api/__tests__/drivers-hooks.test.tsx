/**
 * Tests d'intégration — hooks API drivers
 *
 * Couvre :
 * - useDrivers : liste paginée, filtre at_risk
 * - useDriver  : récupération d'un conducteur par id, 404
 * - useCreateDriver : création avec phone_number optionnel
 * - useDeleteDriver : soft-delete
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { describe, expect, test, vi } from 'vitest';

import { server } from '@/testing/mocks/server';
import { driversHandlers } from '@/testing/mocks/handlers/drivers';

vi.mock('next-auth/react', async () => {
  const actual =
    await vi.importActual<typeof import('next-auth/react')>('next-auth/react');
  return {
    ...actual,
    getSession: vi.fn().mockResolvedValue(null),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
});

import { useDrivers } from '../get-drivers';
import { useDriver } from '../get-driver';
import { useCreateDriver } from '../create-driver';
import { useDeleteDriver } from '../delete-driver';

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

// ─── useDrivers ───────────────────────────────────────────────────────────────

describe('useDrivers', () => {
  test('retourne la liste paginée avec count, next, previous, results', async () => {
    server.use(...driversHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDrivers(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toMatchObject({
      count: 2,
      next: null,
      previous: null,
      results: expect.arrayContaining([
        expect.objectContaining({ numero_permis: 'SN-00001' }),
        expect.objectContaining({ numero_permis: 'SN-00002' }),
      ]),
    });
  });

  test('démarre en état loading', () => {
    server.use(...driversHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDrivers(), { wrapper });
    expect(result.current.isLoading).toBe(true);
  });

  test('filtre at_risk=true est transmis à l\'API', async () => {
    server.use(...driversHandlers);
    let capturedUrl = '';
    server.use(
      http.get('http://localhost:8000/conducteurs/', ({ request }) => {
        capturedUrl = request.url;
        return HttpResponse.json({
          count: 1,
          next: null,
          previous: null,
          results: [],
        });
      }),
    );

    const wrapper = createWrapper();
    renderHook(
      () => useDrivers({ params: { at_risk: true } }),
      { wrapper },
    );

    await waitFor(() => expect(capturedUrl).toContain('at_risk=true'));
  });

  test('retourne une erreur quand l\'API échoue', async () => {
    server.use(
      http.get('http://localhost:8000/conducteurs/', () =>
        HttpResponse.error(),
      ),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDrivers(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  test('chaque conducteur a un patient imbriqué avec full_name', async () => {
    server.use(...driversHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDrivers(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    const driver = result.current.data?.results[0];
    expect(driver?.patient.full_name).toBe('Oumar Ndiaye');
    expect(driver?.patient.is_adult).toBe(true);
  });
});

// ─── useDriver (single) ───────────────────────────────────────────────────────

describe('useDriver', () => {
  test('retourne le détail d\'un conducteur par son id', async () => {
    server.use(...driversHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDriver(1), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.numero_permis).toBe('SN-00001');
    expect(result.current.data?.patient.full_name).toBe('Oumar Ndiaye');
  });

  test('retourne une erreur 404 pour un id inconnu', async () => {
    server.use(...driversHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDriver(9999), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  test('le conducteur 2 a at_risk=true', async () => {
    server.use(...driversHandlers);
    const wrapper = createWrapper();
    const { result } = renderHook(() => useDriver(2), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.patient.at_risk).toBe(true);
  });
});

// ─── useCreateDriver ──────────────────────────────────────────────────────────

describe('useCreateDriver', () => {
  const validDriverPayload = {
    patient: {
      name: 'Ibrahima',
      last_name: 'Fall',
      date_de_naissance: '1985-06-10',
      sex: 'H' as const,
      phone_number: '',
    },
    numero_permis: 'SN-99999',
    type_permis: 'Leger' as const,
    date_delivrance_permis: '2010-01-01',
    date_peremption_permis: '2030-01-01',
    transporteur_professionnel: false,
    service: 'Prive' as const,
    annees_experience: 10,
    type_vehicule_conduit: 'Leger' as const,
    type_instruction_suivie: 'Française' as const,
    niveau_instruction: 'Secondaire' as const,
    prise_en_charge: null,
    zone_de_residence: 'Dakar' as const,
  };

  test('crée un conducteur et appelle onSuccess', async () => {
    server.use(...driversHandlers);
    const onSuccess = vi.fn();
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useCreateDriver({ mutationConfig: { onSuccess } }),
      { wrapper },
    );

    result.current.mutate(validDriverPayload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onSuccess.mock.calls[0][0].numero_permis).toBe('SN-99999');
  });

  test('crée un conducteur sans phone_number (champ optionnel)', async () => {
    server.use(...driversHandlers);
    const onSuccess = vi.fn();
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useCreateDriver({ mutationConfig: { onSuccess } }),
      { wrapper },
    );

    result.current.mutate({
      ...validDriverPayload,
      patient: {
        ...validDriverPayload.patient,
        phone_number: '', // chaîne vide → règle métier : optionnel
      },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  test('appelle POST /conducteurs/create/', async () => {
    server.use(...driversHandlers);
    let capturedUrl = '';
    server.use(
      http.post(
        'http://localhost:8000/conducteurs/create/',
        async ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json(
            {
              id: 50,
              patient: {
                id: 50,
                numero_identifiant: 'PAT-NEW',
                full_name: 'Ibrahima Fall',
                date_de_naissance: '1985-06-10',
                sex: 'H',
                phone_number: null,
                at_risk: false,
                is_adult: true,
              },
              numero_permis: 'SN-99999',
              type_permis: 'Leger',
              autre_type_permis: null,
              date_delivrance_permis: '2010-01-01',
              date_peremption_permis: '2030-01-01',
              transporteur_professionnel: false,
              service: 'Prive',
              annees_experience: 10,
              type_vehicule_conduit: 'Leger',
              type_instruction_suivie: 'Française',
              niveau_instruction: 'Secondaire',
              prise_en_charge: null,
              zone_de_residence: 'Dakar',
              image: null,
              created: new Date().toISOString(),
              modified: new Date().toISOString(),
              is_deleted: false,
              deleted_at: null,
            },
            { status: 201 },
          );
        },
      ),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateDriver(), { wrapper });

    result.current.mutate(validDriverPayload);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedUrl).toContain('/conducteurs/create/');
  });

  test('entre en état error quand l\'API retourne 500', async () => {
    server.use(
      http.post(
        'http://localhost:8000/conducteurs/create/',
        () => new HttpResponse(null, { status: 500 }),
      ),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateDriver(), { wrapper });

    result.current.mutate(validDriverPayload);

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ─── useDeleteDriver ──────────────────────────────────────────────────────────

describe('useDeleteDriver', () => {
  test('soft-delete réussit et appelle onSuccess', async () => {
    server.use(...driversHandlers);
    const onSuccess = vi.fn();
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useDeleteDriver({ mutationConfig: { onSuccess } }),
      { wrapper },
    );

    result.current.mutate(1);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(onSuccess).toHaveBeenCalledOnce();
  });

  test('appelle l\'endpoint correct DELETE /conducteurs/:id/delete/', async () => {
    server.use(...driversHandlers);
    let capturedUrl = '';
    server.use(
      http.delete(
        'http://localhost:8000/conducteurs/:id/delete/',
        ({ request }) => {
          capturedUrl = request.url;
          return new HttpResponse(null, { status: 204 });
        },
      ),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteDriver(), { wrapper });

    result.current.mutate(3);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedUrl).toContain('/conducteurs/3/delete/');
  });

  test('entre en état error si l\'API retourne 500', async () => {
    server.use(
      http.delete(
        'http://localhost:8000/conducteurs/:id/delete/',
        () => new HttpResponse(null, { status: 500 }),
      ),
    );

    const wrapper = createWrapper();
    const { result } = renderHook(() => useDeleteDriver(), { wrapper });

    result.current.mutate(1);

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
