import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { z } from 'zod';

import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';
import { downloadPdf } from '@/utils/download-pdf';

// =============================================================================
// SCHEMA
// =============================================================================

const OrdonnanceMedecinSchema = z.object({
  id: z.number(),
  email: z.string().email().or(z.literal('')),
  first_name: z.string(),
  last_name: z.string(),
  numero_ordre: z.string(),
});

const OrdonnanceStatusSchema = z.object({
  exists: z.boolean(),
  generated_at: z.string().nullable().optional(),
  type_ordonnance: z.enum(['MEDICAMENTEUSE', 'OPTIQUE']).optional(),
  validite_mois: z.number().optional(),
  prescription_data: z.record(z.unknown()).nullable().optional(),
  medecin: OrdonnanceMedecinSchema.nullable().optional(),
});

export type OrdonnanceStatus = z.infer<typeof OrdonnanceStatusSchema>;

// =============================================================================
// FETCHER
// =============================================================================

const getChildOrdonnanceStatus = (examId: number): Promise<OrdonnanceStatus> =>
  api.get<OrdonnanceStatus>(
    `/depistage/examens/enfants/${examId}/ordonnance/status/`,
  );

// =============================================================================
// QUERY OPTIONS
// =============================================================================

export const getChildOrdonnanceStatusQueryOptions = (examId: number) =>
  queryOptions({
    queryKey: ['ordonnance-child-status', examId] as const,
    queryFn: () => getChildOrdonnanceStatus(examId),
    enabled: examId > 0,
    retry: false,
  });

// =============================================================================
// HOOKS
// =============================================================================

export const useChildOrdonnanceStatus = (examId: number) =>
  useQuery(getChildOrdonnanceStatusQueryOptions(examId));

/** POST → generates the ordonnance and streams it as a PDF download */
export const useGenerateChildOrdonnance = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: ({
      examId,
      prescriptionData,
      typeOrdonnance,
      validiteMois,
    }: {
      examId: number;
      prescriptionData: unknown;
      typeOrdonnance: 'MEDICAMENTEUSE' | 'OPTIQUE';
      validiteMois?: number;
    }) =>
      downloadPdf(
        `/depistage/examens/enfants/${examId}/ordonnance/`,
        `ordonnance_${typeOrdonnance.toLowerCase()}_${String(examId).padStart(6, '0')}.pdf`,
        {
          method: 'POST',
          body: {
            type_ordonnance: typeOrdonnance,
            prescription_data: prescriptionData,
            ...(validiteMois ? { validite_mois: validiteMois } : {}),
          },
        },
      ),
    onSuccess: (_data, { examId }) => {
      queryClient.invalidateQueries({
        queryKey: getChildOrdonnanceStatusQueryOptions(examId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: ['ordonnances', 'child', examId],
      });
      addNotification({
        type: 'success',
        title: 'Ordonnance générée',
        message: "L'ordonnance a été générée et sauvegardée.",
      });
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: "Impossible de générer l'ordonnance.",
      });
    },
  });
};

/** GET → downloads a previously generated ordonnance */
export const useDownloadChildOrdonnance = () => {
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: (examId: number) =>
      downloadPdf(
        `/depistage/examens/enfants/${examId}/ordonnance/`,
        `ordonnance-enfant-${examId}.pdf`,
      ),
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: "Impossible de télécharger l'ordonnance.",
      });
    },
  });
};
