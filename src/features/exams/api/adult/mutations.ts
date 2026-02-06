import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

import type {
  ExamenAdultDetailApi,
  ExamenAdultCreate,
  ExamenAdultAddTechnical,
  ExamenAdultAddClinical,
  ExamenAdultProgressive,
  ExamenAdultComplete,
} from '../../types';

import {
  getAdultExamsQueryOptions,
  getAdultExamQueryOptions,
  getIncompleteAdultExamsQueryOptions,
} from './get-adult-exams';

// =============================================================================
// CREATE ADULT EXAM
// =============================================================================

/**
 * Créer un nouvel examen adulte
 */
export const createAdultExam = (
  data: ExamenAdultCreate,
): Promise<ExamenAdultDetailApi> => {
  return api.post<ExamenAdultDetailApi>(
    '/api/v1/depistage/examens/adultes/create/',
    data,
  );
};

type UseCreateAdultExamOptions = {
  mutationConfig?: MutationConfig<typeof createAdultExam>;
};

export const useCreateAdultExam = ({
  mutationConfig = {},
}: UseCreateAdultExamOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    mutationFn: createAdultExam,
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getAdultExamsQueryOptions().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getIncompleteAdultExamsQueryOptions().queryKey,
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
// ADD TECHNICAL DATA
// =============================================================================

type AddTechnicalParams = {
  id: number;
  data: ExamenAdultAddTechnical;
};

/**
 * Ajouter les données techniques à un examen adulte
 */
export const addTechnicalData = ({
  id,
  data,
}: AddTechnicalParams): Promise<ExamenAdultDetailApi> => {
  return api.post<ExamenAdultDetailApi>(
    `/api/v1/depistage/examens/adultes/${id}/add-technical/`,
    data,
  );
};

type UseAddTechnicalDataOptions = {
  mutationConfig?: MutationConfig<typeof addTechnicalData>;
};

export const useAddTechnicalData = ({
  mutationConfig = {},
}: UseAddTechnicalDataOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    mutationFn: addTechnicalData,
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getAdultExamQueryOptions(variables.id).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getIncompleteAdultExamsQueryOptions().queryKey,
      });
      addNotification({
        type: 'success',
        title: 'Données techniques enregistrées',
        message: "Les données techniques ont été ajoutées à l'examen.",
      });
      onSuccess?.(data, variables, ...args);
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: "Impossible d'enregistrer les données techniques.",
      });
    },
    ...restConfig,
  });
};

// =============================================================================
// ADD CLINICAL DATA
// =============================================================================

type AddClinicalParams = {
  id: number;
  data: ExamenAdultAddClinical;
};

/**
 * Ajouter les données cliniques à un examen adulte
 */
export const addClinicalData = ({
  id,
  data,
}: AddClinicalParams): Promise<ExamenAdultDetailApi> => {
  return api.post<ExamenAdultDetailApi>(
    `/api/v1/depistage/examens/adultes/${id}/add-clinical/`,
    data,
  );
};

type UseAddClinicalDataOptions = {
  mutationConfig?: MutationConfig<typeof addClinicalData>;
};

export const useAddClinicalData = ({
  mutationConfig = {},
}: UseAddClinicalDataOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    mutationFn: addClinicalData,
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getAdultExamQueryOptions(variables.id).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getIncompleteAdultExamsQueryOptions().queryKey,
      });
      addNotification({
        type: 'success',
        title: 'Données cliniques enregistrées',
        message: "Les données cliniques ont été ajoutées à l'examen.",
      });
      onSuccess?.(data, variables, ...args);
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: "Impossible d'enregistrer les données cliniques.",
      });
    },
    ...restConfig,
  });
};

// =============================================================================
// UPDATE SECTION (Progressive)
// =============================================================================

type UpdateSectionParams = {
  id: number;
  data: ExamenAdultProgressive;
};

/**
 * Mettre à jour une section spécifique d'un examen adulte
 */
export const updateSection = ({
  id,
  data,
}: UpdateSectionParams): Promise<ExamenAdultDetailApi> => {
  return api.patch<ExamenAdultDetailApi>(
    `/api/v1/depistage/examens/adultes/${id}/section/`,
    data,
  );
};

type UseUpdateSectionOptions = {
  mutationConfig?: MutationConfig<typeof updateSection>;
};

export const useUpdateSection = ({
  mutationConfig = {},
}: UseUpdateSectionOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    mutationFn: updateSection,
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getAdultExamQueryOptions(variables.id).queryKey,
      });
      addNotification({
        type: 'success',
        title: 'Section mise à jour',
        message: `La section ${variables.data.section} a été mise à jour.`,
      });
      onSuccess?.(data, variables, ...args);
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de mettre à jour la section.',
      });
    },
    ...restConfig,
  });
};

// =============================================================================
// COMPLETE EXAM
// =============================================================================

type CompleteExamParams = {
  id: number;
  data?: ExamenAdultComplete;
};

/**
 * Finaliser un examen adulte
 */
export const completeAdultExam = ({
  id,
  data,
}: CompleteExamParams): Promise<ExamenAdultDetailApi> => {
  return api.post<ExamenAdultDetailApi>(
    `/api/v1/depistage/examens/adultes/${id}/complete/`,
    data || { mark_completed: true },
  );
};

type UseCompleteAdultExamOptions = {
  mutationConfig?: MutationConfig<typeof completeAdultExam>;
};

export const useCompleteAdultExam = ({
  mutationConfig = {},
}: UseCompleteAdultExamOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    mutationFn: completeAdultExam,
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getAdultExamQueryOptions(variables.id).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getAdultExamsQueryOptions().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getIncompleteAdultExamsQueryOptions().queryKey,
      });
      addNotification({
        type: 'success',
        title: 'Examen finalisé',
        message: `L'examen ${data.numero_examen} a été marqué comme complet.`,
      });
      onSuccess?.(data, variables, ...args);
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: "Impossible de finaliser l'examen.",
      });
    },
    ...restConfig,
  });
};

// =============================================================================
// DELETE EXAM
// =============================================================================

/**
 * Supprimer un examen adulte
 */
export const deleteAdultExam = (id: number): Promise<void> => {
  return api.delete(`/api/v1/depistage/examens/adultes/${id}/delete/`);
};

type UseDeleteAdultExamOptions = {
  mutationConfig?: MutationConfig<typeof deleteAdultExam>;
};

export const useDeleteAdultExam = ({
  mutationConfig = {},
}: UseDeleteAdultExamOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    mutationFn: deleteAdultExam,
    onSuccess: (data, id, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getAdultExamsQueryOptions().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getIncompleteAdultExamsQueryOptions().queryKey,
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
