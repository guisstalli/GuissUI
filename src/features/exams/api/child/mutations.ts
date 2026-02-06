import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

import type {
  ExamenChildDetailApi,
  ExamenChildCreate,
  TechnicalExamenCreate,
  ClinicalExamenCreate,
} from '../../types';

import {
  getChildExamsQueryOptions,
  getChildExamQueryOptions,
  getIncompleteChildExamsQueryOptions,
} from './get-child-exams';

// =============================================================================
// CREATE CHILD EXAM (Complet - Stepper)
// =============================================================================

/**
 * Créer un examen enfant complet (pattern stepper)
 */
export const createChildExam = (
  data: ExamenChildCreate,
): Promise<ExamenChildDetailApi> => {
  return api.post<ExamenChildDetailApi>(
    '/api/v1/depistage/examens/enfants/create/',
    data,
  );
};

type UseCreateChildExamOptions = {
  mutationConfig?: MutationConfig<typeof createChildExam>;
};

export const useCreateChildExam = ({
  mutationConfig = {},
}: UseCreateChildExamOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    mutationFn: createChildExam,
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getChildExamsQueryOptions().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getIncompleteChildExamsQueryOptions().queryKey,
      });
      addNotification({
        type: 'success',
        title: 'Examen créé',
        message: `L'examen ${data.numero_examen} a été créé.`,
      });
      onSuccess?.(data, ...args);
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: "Impossible de créer l'examen.",
      });
    },
    ...restConfig,
  });
};

// =============================================================================
// CREATE CHILD EXAM (Minimal)
// =============================================================================

/**
 * Créer un examen enfant minimal (sans données techniques/cliniques)
 */
export const createMinimalChildExam = (
  data: ExamenChildCreate,
): Promise<ExamenChildDetailApi> => {
  return api.post<ExamenChildDetailApi>(
    '/api/v1/depistage/examens/enfants/create/minimal/',
    data,
  );
};

type UseCreateMinimalChildExamOptions = {
  mutationConfig?: MutationConfig<typeof createMinimalChildExam>;
};

export const useCreateMinimalChildExam = ({
  mutationConfig = {},
}: UseCreateMinimalChildExamOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    mutationFn: createMinimalChildExam,
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getChildExamsQueryOptions().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getIncompleteChildExamsQueryOptions().queryKey,
      });
      addNotification({
        type: 'success',
        title: 'Examen créé',
        message: `L'examen ${data.numero_examen} a été créé (minimal).`,
      });
      onSuccess?.(data, ...args);
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: "Impossible de créer l'examen.",
      });
    },
    ...restConfig,
  });
};

// =============================================================================
// UPDATE TECHNICAL DATA
// =============================================================================

type UpdateTechnicalParams = {
  id: number;
  data: TechnicalExamenCreate;
};

/**
 * Mettre à jour les données techniques (PUT)
 */
export const updateTechnicalData = ({
  id,
  data,
}: UpdateTechnicalParams): Promise<ExamenChildDetailApi> => {
  return api.put<ExamenChildDetailApi>(
    `/api/v1/depistage/examens/enfants/${id}/technical/`,
    data,
  );
};

/**
 * Mettre à jour partiellement les données techniques (PATCH)
 */
export const patchTechnicalData = ({
  id,
  data,
}: UpdateTechnicalParams): Promise<ExamenChildDetailApi> => {
  return api.patch<ExamenChildDetailApi>(
    `/api/v1/depistage/examens/enfants/${id}/technical/`,
    data,
  );
};

type UseUpdateTechnicalDataOptions = {
  mutationConfig?: MutationConfig<typeof updateTechnicalData>;
};

export const useUpdateTechnicalData = ({
  mutationConfig = {},
}: UseUpdateTechnicalDataOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    mutationFn: updateTechnicalData,
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getChildExamQueryOptions(variables.id).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getIncompleteChildExamsQueryOptions().queryKey,
      });
      addNotification({
        type: 'success',
        title: 'Données techniques mises à jour',
        message: 'Les données techniques ont été enregistrées.',
      });
      onSuccess?.(data, variables, ...args);
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de mettre à jour les données techniques.',
      });
    },
    ...restConfig,
  });
};

// =============================================================================
// UPDATE CLINICAL DATA
// =============================================================================

type UpdateClinicalParams = {
  id: number;
  data: ClinicalExamenCreate;
};

/**
 * Mettre à jour les données cliniques (PUT)
 */
export const updateClinicalData = ({
  id,
  data,
}: UpdateClinicalParams): Promise<ExamenChildDetailApi> => {
  return api.put<ExamenChildDetailApi>(
    `/api/v1/depistage/examens/enfants/${id}/clinical/`,
    data,
  );
};

/**
 * Mettre à jour partiellement les données cliniques (PATCH)
 */
export const patchClinicalData = ({
  id,
  data,
}: UpdateClinicalParams): Promise<ExamenChildDetailApi> => {
  return api.patch<ExamenChildDetailApi>(
    `/api/v1/depistage/examens/enfants/${id}/clinical/`,
    data,
  );
};

type UseUpdateClinicalDataOptions = {
  mutationConfig?: MutationConfig<typeof updateClinicalData>;
};

export const useUpdateClinicalData = ({
  mutationConfig = {},
}: UseUpdateClinicalDataOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    mutationFn: updateClinicalData,
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getChildExamQueryOptions(variables.id).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getIncompleteChildExamsQueryOptions().queryKey,
      });
      addNotification({
        type: 'success',
        title: 'Données cliniques mises à jour',
        message: 'Les données cliniques ont été enregistrées.',
      });
      onSuccess?.(data, variables, ...args);
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de mettre à jour les données cliniques.',
      });
    },
    ...restConfig,
  });
};

// =============================================================================
// DELETE EXAM
// =============================================================================

/**
 * Supprimer un examen enfant
 */
export const deleteChildExam = (id: number): Promise<void> => {
  return api.delete(`/api/v1/depistage/examens/enfants/${id}/delete/`);
};

type UseDeleteChildExamOptions = {
  mutationConfig?: MutationConfig<typeof deleteChildExam>;
};

export const useDeleteChildExam = ({
  mutationConfig = {},
}: UseDeleteChildExamOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    mutationFn: deleteChildExam,
    onSuccess: (data, id, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getChildExamsQueryOptions().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getIncompleteChildExamsQueryOptions().queryKey,
      });
      addNotification({
        type: 'success',
        title: 'Examen supprimé',
        message: "L'examen a été supprimé.",
      });
      onSuccess?.(data, id, ...args);
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: "Impossible de supprimer l'examen.",
      });
    },
    ...restConfig,
  });
};
