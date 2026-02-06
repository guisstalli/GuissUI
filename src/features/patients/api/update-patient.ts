import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

import type { Patient, PatientUpdate } from '../types';

import { getPatientQueryOptions } from './get-patient';
import { getPatientsQueryOptions } from './get-patients';

type UpdatePatientParams = {
  id: number;
  data: PatientUpdate;
};

/**
 * Mettre à jour un patient (complet - PUT)
 */
export const updatePatient = ({
  id,
  data,
}: UpdatePatientParams): Promise<Patient> => {
  return api.put<Patient>(`/api/v1/depistage/patients/${id}/edit/`, data);
};

/**
 * Mettre à jour un patient (partiel - PATCH)
 */
export const patchPatient = ({
  id,
  data,
}: UpdatePatientParams): Promise<Patient> => {
  return api.patch<Patient>(`/api/v1/depistage/patients/${id}/edit/`, data);
};

type UseUpdatePatientOptions = {
  mutationConfig?: MutationConfig<typeof updatePatient>;
};

/**
 * Hook React Query mutation pour mettre à jour un patient (PUT)
 */
export const useUpdatePatient = ({
  mutationConfig = {},
}: UseUpdatePatientOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    mutationFn: updatePatient,
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getPatientQueryOptions(variables.id).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getPatientsQueryOptions().queryKey,
      });
      addNotification({
        type: 'success',
        title: 'Patient mis à jour',
        message: `Les informations de ${data.full_name} ont été mises à jour.`,
      });
      onSuccess?.(data, variables, ...args);
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de mettre à jour le patient.',
      });
    },
    ...restConfig,
  });
};

type UsePatchPatientOptions = {
  mutationConfig?: MutationConfig<typeof patchPatient>;
};

/**
 * Hook React Query mutation pour mettre à jour partiellement un patient (PATCH)
 */
export const usePatchPatient = ({
  mutationConfig = {},
}: UsePatchPatientOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    mutationFn: patchPatient,
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getPatientQueryOptions(variables.id).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getPatientsQueryOptions().queryKey,
      });
      addNotification({
        type: 'success',
        title: 'Patient mis à jour',
        message: `Les informations de ${data.full_name} ont été mises à jour.`,
      });
      onSuccess?.(data, variables, ...args);
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de mettre à jour le patient.',
      });
    },
    ...restConfig,
  });
};
