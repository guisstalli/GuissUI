import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { z } from 'zod';

import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

import { getAdultExamQueryOptions } from './get-adult-exams';

// =============================================================================
// SCHEMAS
// =============================================================================

export const DriverExperienceSchema = z.object({
  id: z.number(),
  visit_number: z.number(),
  date_visite: z.string().nullable().optional(),
  etat_conducteur: z.string().nullable().optional(),
  deces_cause: z.string().nullable().optional(),
  inactif_cause: z.string().nullable().optional(),
  km_parcourus: z.string().nullable().optional(),
  nombre_accidents: z.number().nullable().optional(),
  tranche_horaire: z.string().nullable().optional(),
  corporel_dommage: z.boolean().optional(),
  corporel_dommage_type: z.string().nullable().optional(),
  materiel_dommage: z.boolean().optional(),
  materiel_dommage_type: z.string().nullable().optional(),
  date_dernier_accident: z.string().nullable().optional(),
});

export type DriverExperience = z.infer<typeof DriverExperienceSchema>;

export type DriverExperienceInput = Partial<
  Omit<DriverExperience, 'id' | 'visit_number'>
>;

// =============================================================================
// GET
// =============================================================================

export const getDriverExperience = (
  examId: number,
): Promise<DriverExperience> =>
  api.get<DriverExperience>(`/drivers/exams/${examId}/driver-experience/`);

export const getDriverExperienceQueryOptions = (examId: number) =>
  queryOptions({
    queryKey: ['driver-experience', examId],
    queryFn: () => getDriverExperience(examId),
    enabled: !!examId,
  });

type UseDriverExperienceOptions = {
  examId: number;
  enabled?: boolean;
};

export const useDriverExperience = ({
  examId,
  enabled = true,
}: UseDriverExperienceOptions) =>
  useQuery({
    ...getDriverExperienceQueryOptions(examId),
    enabled: enabled && !!examId,
  });

// =============================================================================
// UPSERT (POST creates, POST on existing replaces — backend handles both)
// =============================================================================

type UpsertDriverExperienceParams = {
  examId: number;
  data: DriverExperienceInput;
};

export const upsertDriverExperience = ({
  examId,
  data,
}: UpsertDriverExperienceParams): Promise<DriverExperience> =>
  api.post<DriverExperience>(
    `/drivers/exams/${examId}/driver-experience/`,
    data,
  );

type UseUpsertDriverExperienceOptions = {
  mutationConfig?: MutationConfig<typeof upsertDriverExperience>;
};

export const useUpsertDriverExperience = ({
  mutationConfig = {},
}: UseUpsertDriverExperienceOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    mutationFn: upsertDriverExperience,
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({
        queryKey: getDriverExperienceQueryOptions(variables.examId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getAdultExamQueryOptions(variables.examId).queryKey,
      });
      addNotification({
        type: 'success',
        title: 'Expérience conduite sauvegardée',
        message: `Visite ${data.visit_number} enregistrée.`,
      });
      onSuccess?.(data, variables, ...args);
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: "Impossible de sauvegarder l'expérience conduite.",
      });
    },
    ...restConfig,
  });
};
