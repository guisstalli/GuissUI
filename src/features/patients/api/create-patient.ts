import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

import type { Patient, PatientCreate } from '../types';

import { getPatientsQueryOptions } from './get-patients';

/**
 * Créer un nouveau patient
 */
export const createPatient = (data: PatientCreate): Promise<Patient> => {
  return api.post<Patient>('/api/v1/depistage/patients/create/', data);
};

type UseCreatePatientOptions = {
  mutationConfig?: MutationConfig<typeof createPatient>;
};

/**
 * Hook React Query mutation pour créer un patient
 */
export const useCreatePatient = ({
  mutationConfig = {},
}: UseCreatePatientOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    mutationFn: createPatient,
    onSuccess: (data, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getPatientsQueryOptions().queryKey,
      });
      addNotification({
        type: 'success',
        title: 'Patient créé',
        message: `Le patient ${data.full_name} a été créé avec succès.`,
      });
      onSuccess?.(data, ...args);
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de créer le patient.',
      });
    },
    ...restConfig,
  });
};
