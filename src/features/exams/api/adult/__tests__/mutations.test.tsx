import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { server } from '@/testing/mocks/server';

import { useAddTechnicalData, useAddClinicalData } from '../mutations';

// =============================================================================
// Factory: mock d'une réponse d'examen adulte
// =============================================================================

const mockExamAdultDetail = {
  id: 42,
  numero_examen: 'EX-2024-001',
  patient: {
    id: 1,
    numero_identifiant: 'P001',
    last_name: 'Dupont',
    name: 'Jean',
    full_name: 'Jean Dupont',
    date_de_naissance: '1980-01-15',
    age: 44,
    sex: 'H',
    is_adult: true,
    phone_number: null,
    created: '2024-01-01T00:00:00Z',
  },
  is_completed: false,
  technical_examen: null,
  clinical_examen: null,
  completion_status: {},
  created: '2024-01-01T00:00:00Z',
  modified: '2024-01-01T00:00:00Z',
};

// =============================================================================
// Wrapper React Query pour les hooks
// =============================================================================

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity },
      mutations: { retry: false },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  }

  return { wrapper: Wrapper, queryClient };
}

// =============================================================================
// useAddTechnicalData
// =============================================================================

describe('useAddTechnicalData', () => {
  const API_URL = 'http://localhost:8000';

  describe('succès', () => {
    beforeEach(() => {
      server.use(
        http.post(
          `${API_URL}/depistage/examens/adultes/:id/add-technical/`,
          () => HttpResponse.json(mockExamAdultDetail, { status: 200 }),
        ),
      );
    });

    it('appelle le callback onSuccess après une mutation réussie', async () => {
      // Arrange
      const onSuccess = vi.fn();
      const { wrapper } = createWrapper();
      const { result } = renderHook(
        () => useAddTechnicalData({ mutationConfig: { onSuccess } }),
        { wrapper },
      );

      // Act
      act(() => {
        result.current.mutate({
          id: 42,
          data: {
            visualAcuity: { correction: false },
            refraction: { correction: false },
            ocularTension: {},
          } as never,
        });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(onSuccess).toHaveBeenCalledWith(
        mockExamAdultDetail,
        expect.objectContaining({ id: 42 }),
        undefined,
      );
    });

    it('invalide les queries après une mutation réussie', async () => {
      // Arrange
      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const { result } = renderHook(() => useAddTechnicalData(), { wrapper });

      // Act
      act(() => {
        result.current.mutate({
          id: 42,
          data: {} as never,
        });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(invalidateSpy).toHaveBeenCalled();
    });
  });

  describe('erreur 400', () => {
    beforeEach(() => {
      server.use(
        http.post(
          `${API_URL}/depistage/examens/adultes/:id/add-technical/`,
          () =>
            HttpResponse.json({ detail: 'Données invalides' }, { status: 400 }),
        ),
      );
    });

    it('met isError=true après une réponse 400', async () => {
      // Arrange
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useAddTechnicalData(), { wrapper });

      // Act
      act(() => {
        result.current.mutate({
          id: 42,
          data: {} as never,
        });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  describe('erreur réseau', () => {
    beforeEach(() => {
      server.use(
        http.post(
          `${API_URL}/depistage/examens/adultes/:id/add-technical/`,
          () => HttpResponse.error(),
        ),
      );
    });

    it('met isError=true en cas d erreur réseau', async () => {
      // Arrange
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useAddTechnicalData(), { wrapper });

      // Act
      act(() => {
        result.current.mutate({
          id: 42,
          data: {} as never,
        });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});

// =============================================================================
// useAddClinicalData
// =============================================================================

describe('useAddClinicalData', () => {
  const API_URL = 'http://localhost:8000';

  describe('succès', () => {
    beforeEach(() => {
      server.use(
        http.post(
          `${API_URL}/depistage/examens/adultes/:id/add-clinical/`,
          () =>
            HttpResponse.json(
              { ...mockExamAdultDetail, is_completed: true },
              { status: 200 },
            ),
        ),
      );
    });

    it('appelle le callback onSuccess avec les données de l examen', async () => {
      // Arrange
      const onSuccess = vi.fn();
      const { wrapper } = createWrapper();
      const { result } = renderHook(
        () => useAddClinicalData({ mutationConfig: { onSuccess } }),
        { wrapper },
      );

      // Act
      act(() => {
        result.current.mutate({
          id: 42,
          data: {} as never,
        });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ id: 42 }),
        expect.objectContaining({ id: 42 }),
        undefined,
      );
    });

    it('invalide les queries après une mutation réussie', async () => {
      // Arrange
      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const { result } = renderHook(() => useAddClinicalData(), { wrapper });

      // Act
      act(() => {
        result.current.mutate({
          id: 42,
          data: {} as never,
        });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(invalidateSpy).toHaveBeenCalled();
    });
  });

  describe('erreur 400', () => {
    beforeEach(() => {
      server.use(
        http.post(
          `${API_URL}/depistage/examens/adultes/:id/add-clinical/`,
          () =>
            HttpResponse.json(
              { detail: 'Données cliniques invalides' },
              { status: 400 },
            ),
        ),
      );
    });

    it('met isError=true après une réponse 400', async () => {
      // Arrange
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useAddClinicalData(), { wrapper });

      // Act
      act(() => {
        result.current.mutate({
          id: 42,
          data: {} as never,
        });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});
