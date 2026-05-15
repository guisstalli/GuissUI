import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { server } from '@/testing/mocks/server';

import { useUpdateTechnicalData, useUpdateClinicalData } from '../mutations';

// =============================================================================
// Factory: mock d'une réponse d'examen enfant
// =============================================================================

const mockExamChildDetail = {
  id: 10,
  numero_examen: 'EX-ENF-2024-001',
  patient: {
    id: 2,
    numero_identifiant: 'P002',
    last_name: 'Martin',
    name: 'Sophie',
    full_name: 'Sophie Martin',
    date_de_naissance: '2018-05-20',
    age: 6,
    sex: 'F',
    is_adult: false,
    phone_number: null,
    created: '2024-01-01T00:00:00Z',
  },
  simplified_clinical_exam: null,
  clinical_examen: null,
  reflet_pupillaire: null,
  reflet_pupillaire_detail: null,
  fo: null,
  fo_detail: null,
  visual_acuity: null,
  ocular_tension: null,
  refraction: null,
  vision_binoculaire: null,
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
// useUpdateTechnicalData
// =============================================================================

describe('useUpdateTechnicalData', () => {
  const API_URL = 'http://localhost:8000';

  describe('succès', () => {
    beforeEach(() => {
      server.use(
        http.put(`${API_URL}/depistage/examens/enfants/:id/technical/`, () =>
          HttpResponse.json(mockExamChildDetail, { status: 200 }),
        ),
      );
    });

    it('appelle le callback onSuccess après une mutation réussie', async () => {
      // Arrange
      const onSuccess = vi.fn();
      const { wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUpdateTechnicalData({ mutationConfig: { onSuccess } }),
        { wrapper },
      );

      // Act
      act(() => {
        result.current.mutate({
          id: 10,
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
        mockExamChildDetail,
        expect.objectContaining({ id: 10 }),
        undefined,
      );
    });

    it('invalide les queries après une mutation réussie', async () => {
      // Arrange
      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const { result } = renderHook(() => useUpdateTechnicalData(), {
        wrapper,
      });

      // Act
      act(() => {
        result.current.mutate({
          id: 10,
          data: {} as never,
        });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(invalidateSpy).toHaveBeenCalled();
    });

    it('envoie la requête PUT à l endpoint correct', async () => {
      // Arrange
      let capturedUrl: string | null = null;
      server.use(
        http.put(
          `${API_URL}/depistage/examens/enfants/:id/technical/`,
          ({ request }) => {
            capturedUrl = request.url;
            return HttpResponse.json(mockExamChildDetail, { status: 200 });
          },
        ),
      );

      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useUpdateTechnicalData(), {
        wrapper,
      });

      // Act
      act(() => {
        result.current.mutate({ id: 10, data: {} as never });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(capturedUrl).toContain('/depistage/examens/enfants/10/technical/');
    });
  });

  describe('erreur 400', () => {
    beforeEach(() => {
      server.use(
        http.put(`${API_URL}/depistage/examens/enfants/:id/technical/`, () =>
          HttpResponse.json(
            { detail: 'Données techniques invalides' },
            { status: 400 },
          ),
        ),
      );
    });

    it('met isError=true après une réponse 400', async () => {
      // Arrange
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useUpdateTechnicalData(), {
        wrapper,
      });

      // Act
      act(() => {
        result.current.mutate({ id: 10, data: {} as never });
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
        http.put(`${API_URL}/depistage/examens/enfants/:id/technical/`, () =>
          HttpResponse.error(),
        ),
      );
    });

    it('met isError=true en cas d erreur réseau', async () => {
      // Arrange
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useUpdateTechnicalData(), {
        wrapper,
      });

      // Act
      act(() => {
        result.current.mutate({ id: 10, data: {} as never });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});

// =============================================================================
// useUpdateClinicalData
// =============================================================================

describe('useUpdateClinicalData', () => {
  const API_URL = 'http://localhost:8000';

  describe('succès', () => {
    beforeEach(() => {
      server.use(
        http.put(`${API_URL}/depistage/examens/enfants/:id/clinical/`, () =>
          HttpResponse.json(
            { ...mockExamChildDetail, simplified_clinical_exam: true },
            { status: 200 },
          ),
        ),
      );
    });

    it('appelle le callback onSuccess après une mutation réussie', async () => {
      // Arrange
      const onSuccess = vi.fn();
      const { wrapper } = createWrapper();
      const { result } = renderHook(
        () => useUpdateClinicalData({ mutationConfig: { onSuccess } }),
        { wrapper },
      );

      // Act
      act(() => {
        result.current.mutate({
          id: 10,
          data: {} as never,
        });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(onSuccess).toHaveBeenCalledWith(
        expect.objectContaining({ id: 10 }),
        expect.objectContaining({ id: 10 }),
        undefined,
      );
    });

    it('invalide les queries après une mutation réussie', async () => {
      // Arrange
      const { wrapper, queryClient } = createWrapper();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
      const { result } = renderHook(() => useUpdateClinicalData(), { wrapper });

      // Act
      act(() => {
        result.current.mutate({ id: 10, data: {} as never });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(invalidateSpy).toHaveBeenCalled();
    });

    it('envoie la requête PUT à l endpoint /clinical/ avec le flag simplified_clinical_exam', async () => {
      // Arrange
      let capturedBody: unknown = null;
      server.use(
        http.put(
          `${API_URL}/depistage/examens/enfants/:id/clinical/`,
          async ({ request }) => {
            capturedBody = await request.json();
            return HttpResponse.json(mockExamChildDetail, { status: 200 });
          },
        ),
      );

      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useUpdateClinicalData(), { wrapper });

      // Act
      act(() => {
        result.current.mutate({
          id: 10,
          data: { simplified_clinical_exam: true } as never,
        });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(capturedBody).toEqual(
        expect.objectContaining({ simplified_clinical_exam: true }),
      );
    });

    it('envoie la requête PUT à l endpoint correct avec l id correct', async () => {
      // Arrange
      let capturedId: string | undefined;
      server.use(
        http.put(
          `${API_URL}/depistage/examens/enfants/:id/clinical/`,
          ({ params }) => {
            capturedId = params.id as string;
            return HttpResponse.json(mockExamChildDetail, { status: 200 });
          },
        ),
      );

      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useUpdateClinicalData(), { wrapper });

      // Act
      act(() => {
        result.current.mutate({ id: 10, data: {} as never });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
      expect(capturedId).toBe('10');
    });
  });

  describe('erreur 400', () => {
    beforeEach(() => {
      server.use(
        http.put(`${API_URL}/depistage/examens/enfants/:id/clinical/`, () =>
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
      const { result } = renderHook(() => useUpdateClinicalData(), { wrapper });

      // Act
      act(() => {
        result.current.mutate({ id: 10, data: {} as never });
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
        http.put(`${API_URL}/depistage/examens/enfants/:id/clinical/`, () =>
          HttpResponse.error(),
        ),
      );
    });

    it('met isError=true en cas d erreur réseau', async () => {
      // Arrange
      const { wrapper } = createWrapper();
      const { result } = renderHook(() => useUpdateClinicalData(), { wrapper });

      // Act
      act(() => {
        result.current.mutate({ id: 10, data: {} as never });
      });

      // Assert
      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });
});
