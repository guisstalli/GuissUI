import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

import type { Patient } from '../types';

import {
  getPatientsQueryOptions,
  getDeletedPatientsQueryOptions,
} from './get-patients';

/**
 * Soft-delete un patient (le marque comme supprimé)
 */
export const deletePatient = (id: number): Promise<void> => {
  return api.delete(`/api/v1/depistage/patients/${id}/delete/`);
};

/**
 * Hard-delete un patient (suppression définitive)
 */
export const hardDeletePatient = (id: number): Promise<void> => {
  return api.delete(`/api/v1/depistage/patients/${id}/hard-delete/`);
};

/**
 * Restaurer un patient soft-deleted
 */
export const restorePatient = (id: number): Promise<Patient> => {
  return api.post<Patient>(`/api/v1/depistage/patients/${id}/restore/`);
};

type UseDeletePatientOptions = {
  mutationConfig?: MutationConfig<typeof deletePatient>;
};

/**
 * Hook React Query mutation pour soft-delete un patient
 */
export const useDeletePatient = ({
  mutationConfig = {},
}: UseDeletePatientOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    mutationFn: deletePatient,
    onSuccess: (data, id, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getPatientsQueryOptions().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getDeletedPatientsQueryOptions().queryKey,
      });
      addNotification({
        type: 'success',
        title: 'Patient supprimé',
        message: 'Le patient a été supprimé. Il peut être restauré.',
      });
      onSuccess?.(data, id, ...args);
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message:
          "Impossible de supprimer le patient. Vérifiez qu'il n'a pas d'examens.",
      });
    },
    ...restConfig,
  });
};

type UseHardDeletePatientOptions = {
  mutationConfig?: MutationConfig<typeof hardDeletePatient>;
};

/**
 * Hook React Query mutation pour hard-delete un patient
 */
export const useHardDeletePatient = ({
  mutationConfig = {},
}: UseHardDeletePatientOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    mutationFn: hardDeletePatient,
    onSuccess: (data, id, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getPatientsQueryOptions().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getDeletedPatientsQueryOptions().queryKey,
      });
      addNotification({
        type: 'warning',
        title: 'Patient supprimé définitivement',
        message: 'Le patient a été supprimé de façon irréversible.',
      });
      onSuccess?.(data, id, ...args);
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de supprimer définitivement le patient.',
      });
    },
    ...restConfig,
  });
};

type UseRestorePatientOptions = {
  mutationConfig?: MutationConfig<typeof restorePatient>;
};

/**
 * Hook React Query mutation pour restaurer un patient
 */
export const useRestorePatient = ({
  mutationConfig = {},
}: UseRestorePatientOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    mutationFn: restorePatient,
    onSuccess: (data, id, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getPatientsQueryOptions().queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getDeletedPatientsQueryOptions().queryKey,
      });
      addNotification({
        type: 'success',
        title: 'Patient restauré',
        message: `Le patient ${data.full_name} a été restauré.`,
      });
      onSuccess?.(data, id, ...args);
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de restaurer le patient.',
      });
    },
    ...restConfig,
  });
};
