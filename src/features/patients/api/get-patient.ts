import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Patient } from '../types';

/**
 * Récupère un patient par son ID
 */
export const getPatient = (id: number): Promise<Patient> => {
  return api.get<Patient>(`/api/v1/depistage/patients/${id}/`);
};

/**
 * Query options pour un patient
 */
export const getPatientQueryOptions = (id: number) => {
  return queryOptions({
    queryKey: ['patient', id],
    queryFn: () => getPatient(id),
    enabled: !!id,
  });
};

type UsePatientOptions = {
  id: number;
  enabled?: boolean;
};

/**
 * Hook React Query pour récupérer un patient
 */
export const usePatient = ({ id, enabled = true }: UsePatientOptions) => {
  return useQuery({
    ...getPatientQueryOptions(id),
    enabled: enabled && !!id,
  });
};
