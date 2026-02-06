import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

import type { Antecedent, AntecedentCreate } from '../types';

/**
 * Récupère les antécédents d'un patient
 * Note: Retourne 404 si le patient n'a pas encore d'antécédents
 */
export const getAntecedent = (patientId: number): Promise<Antecedent> => {
  return api.get<Antecedent>(
    `/api/v1/depistage/patients/${patientId}/antecedent/`,
    { silentStatusCodes: [404] }, // Ne pas afficher de toast pour 404
  );
};

/**
 * Query options pour les antécédents
 * Retourne null si le patient n'a pas encore d'antécédents (404)
 */
export const getAntecedentQueryOptions = (patientId: number) => {
  return queryOptions({
    queryKey: ['patient', patientId, 'antecedent'],
    queryFn: async () => {
      try {
        return await getAntecedent(patientId);
      } catch (error: unknown) {
        // Si 404, le patient n'a pas encore d'antécédents - retourne null
        if (
          error &&
          typeof error === 'object' &&
          'status' in error &&
          (error as { status: number }).status === 404
        ) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!patientId,
  });
};

type UseAntecedentOptions = {
  patientId: number;
  enabled?: boolean;
};

/**
 * Hook React Query pour récupérer les antécédents d'un patient
 * Retourne null si le patient n'a pas encore d'antécédents
 */
export const useAntecedent = ({
  patientId,
  enabled = true,
}: UseAntecedentOptions) => {
  return useQuery({
    ...getAntecedentQueryOptions(patientId),
    enabled: enabled && !!patientId,
  });
};

type UpdateAntecedentParams = {
  patientId: number;
  data: AntecedentCreate;
};

/**
 * Créer ou modifier les antécédents d'un patient (POST)
 */
export const createOrUpdateAntecedent = ({
  patientId,
  data,
}: UpdateAntecedentParams): Promise<Antecedent> => {
  return api.post<Antecedent>(
    `/api/v1/depistage/patients/${patientId}/antecedent/edit/`,
    data,
  );
};

/**
 * Modifier les antécédents d'un patient (PUT)
 */
export const updateAntecedent = ({
  patientId,
  data,
}: UpdateAntecedentParams): Promise<Antecedent> => {
  return api.put<Antecedent>(
    `/api/v1/depistage/patients/${patientId}/antecedent/edit/`,
    data,
  );
};

type UseUpdateAntecedentOptions = {
  mutationConfig?: MutationConfig<typeof updateAntecedent>;
};

/**
 * Hook React Query mutation pour créer/modifier les antécédents
 */
export const useUpdateAntecedent = ({
  mutationConfig = {},
}: UseUpdateAntecedentOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    mutationFn: createOrUpdateAntecedent,
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getAntecedentQueryOptions(variables.patientId).queryKey,
      });
      addNotification({
        type: 'success',
        title: 'Antécédents mis à jour',
        message: 'Les antécédents du patient ont été enregistrés.',
      });
      onSuccess?.(data, variables, ...args);
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de mettre à jour les antécédents.',
      });
    },
    ...restConfig,
  });
};
