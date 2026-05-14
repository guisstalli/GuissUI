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

import { useAddPaiement } from '../add-paiement';
import { useAnnulerFacture } from '../annuler-facture';
import { useCreateFacture } from '../create-facture';
import { useEmettreFacture } from '../emettre-facture';
import { useFacture } from '../get-facture';
import { useFactures } from '../get-factures';

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

// ─── useFactures ──────────────────────────────────────────────────────────────

describe('useFactures', () => {
  test('returns the paginated factures list on success', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useFactures(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.results).toHaveLength(2);
    expect(result.current.data?.results[0].numero).toBe('FAC-2026-001');
  });

  test('starts in a loading state', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useFactures(), { wrapper });
    expect(result.current.isLoading).toBe(true);
  });

  test('returns an error when the API fails', async () => {
    server.use(
      http.get('http://localhost:8000/billing/factures/', () =>
        HttpResponse.error(),
      ),
    );
    const wrapper = createWrapper();
    const { result } = renderHook(() => useFactures(), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  test('passes query params to the API', async () => {
    let capturedUrl = '';
    server.use(
      http.get('http://localhost:8000/billing/factures/', ({ request }) => {
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
      () => useFactures({ params: { statut: 'emise', limit: 5 } }),
      { wrapper },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedUrl).toContain('statut=emise');
    expect(capturedUrl).toContain('limit=5');
  });
});

// ─── useFacture (single) ──────────────────────────────────────────────────────

describe('useFacture', () => {
  test('returns the facture detail for a given id', async () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useFacture(1), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.numero).toBe('FAC-2026-001');
    expect(result.current.data?.patient_nom).toBe('Dupont');
  });

  test('returns 404 error when facture is not found', async () => {
    const wrapper = createWrapper();
    // The billing handler returns 404 for unknown IDs
    const { result } = renderHook(() => useFacture(9999), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ─── useCreateFacture ─────────────────────────────────────────────────────────

describe('useCreateFacture', () => {
  test('calls the POST endpoint and invokes onSuccess callback', async () => {
    const onSuccess = vi.fn();
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useCreateFacture({ mutationConfig: { onSuccess } }),
      { wrapper },
    );

    result.current.mutate({
      site_id: 1,
      patient_nom: 'Dupont',
      patient_prenom: 'Alice',
      lignes: [{ prestation_id: 1, quantite: 1, prix_unitaire: '25000.00' }],
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onSuccess.mock.calls[0][0].numero).toBe('FAC-2026-099');
  });

  test('enters an error state when the API returns a server error', async () => {
    server.use(
      http.post(
        'http://localhost:8000/billing/factures/',
        () => new HttpResponse(null, { status: 500 }),
      ),
    );
    const wrapper = createWrapper();
    const { result } = renderHook(() => useCreateFacture(), { wrapper });

    result.current.mutate({
      site_id: 1,
      lignes: [{ quantite: 1, prix_unitaire: '100.00' }],
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ─── useEmettreFacture ────────────────────────────────────────────────────────

describe('useEmettreFacture', () => {
  test('calls the emettre endpoint and returns the updated facture', async () => {
    const onSuccess = vi.fn();
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useEmettreFacture({ mutationConfig: { onSuccess } }),
      { wrapper },
    );

    result.current.mutate(1);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(onSuccess).toHaveBeenCalledOnce();
    const updatedFacture = onSuccess.mock.calls[0][0];
    expect(updatedFacture.statut).toBe('emise');
  });

  test('calls the correct endpoint URL', async () => {
    let capturedUrl = '';
    server.use(
      http.post(
        'http://localhost:8000/billing/factures/:id/emettre/',
        ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json({ id: 7, statut: 'emise' });
        },
      ),
    );
    const wrapper = createWrapper();
    const { result } = renderHook(() => useEmettreFacture(), { wrapper });

    result.current.mutate(7);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedUrl).toContain('/billing/factures/7/emettre/');
  });
});

// ─── useAnnulerFacture ────────────────────────────────────────────────────────

describe('useAnnulerFacture', () => {
  test('calls the annuler endpoint and returns statut "annulee"', async () => {
    const onSuccess = vi.fn();
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useAnnulerFacture({ mutationConfig: { onSuccess } }),
      { wrapper },
    );

    result.current.mutate(1);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(onSuccess).toHaveBeenCalledOnce();
    expect(onSuccess.mock.calls[0][0].statut).toBe('annulee');
  });
});

// ─── useAddPaiement ───────────────────────────────────────────────────────────

describe('useAddPaiement', () => {
  test('posts the paiement to the correct facture endpoint', async () => {
    let capturedUrl = '';
    server.use(
      http.post(
        'http://localhost:8000/billing/factures/:id/paiements/',
        ({ request }) => {
          capturedUrl = request.url;
          return HttpResponse.json(
            {
              id: 50,
              montant: '25000.00',
              mode: 'especes',
              date_paiement: '2026-05-11',
            },
            { status: 201 },
          );
        },
      ),
    );

    const onSuccess = vi.fn();
    const wrapper = createWrapper();
    const { result } = renderHook(
      () => useAddPaiement({ mutationConfig: { onSuccess } }),
      { wrapper },
    );

    result.current.mutate({
      factureId: 1,
      data: {
        montant: '25000.00',
        mode: 'especes',
        date_paiement: '2026-05-11',
      },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(capturedUrl).toContain('/billing/factures/1/paiements/');
    expect(onSuccess).toHaveBeenCalledOnce();
  });
});
