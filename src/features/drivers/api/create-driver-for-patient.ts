import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Driver, DriverCreate } from '../types/schemas';

/**
 * Rattache un dossier conducteur à un patient DÉJÀ existant.
 *
 * `useCreateDriver` passe par `/conducteurs/create/`, qui exige un patient
 * imbriqué et en crée donc toujours un nouveau. Après un check-in d'événement
 * le patient existe : l'employer ici produirait un DOUBLON.
 */
export type DriverForPatientInput = Omit<DriverCreate, 'patient'> & {
  patient_id: number;
};

const createDriverForPatient = (data: DriverForPatientInput): Promise<Driver> =>
  api.post('/conducteurs/create-for-patient/', data);

export const useCreateDriverForPatient = ({
  mutationConfig,
}: {
  mutationConfig?: { onSuccess?: (driver: Driver) => void };
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDriverForPatient,
    onSuccess: (driver) => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
      // L'écran d'accueil affiche l'état de chaque inscription : sans cette
      // invalidation, l'action resterait proposée après coup.
      queryClient.invalidateQueries({ queryKey: ['events'] });
      mutationConfig?.onSuccess?.(driver);
    },
  });
};
