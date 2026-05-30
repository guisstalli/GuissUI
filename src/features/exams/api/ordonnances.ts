/**
 * Multi-ordonnance API — un examen peut porter jusqu'à 2 ordonnances
 * distinctes (médicamenteuse + optique). Ce module fournit :
 *
 *   - useExamOrdonnances(examType, examId) — liste les 0/1/2 ordonnances
 *   - useDownloadOrdonnance() — télécharge par ID global
 *
 * Coexiste avec les anciens hooks `useAdult/ChildOrdonnanceStatus` (legacy)
 * qui restent exposés 1 release pour rétro-compat.
 */
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';
import { downloadPdf } from '@/utils/download-pdf';

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

export const TypeOrdonnanceSchema = z.enum(['MEDICAMENTEUSE', 'OPTIQUE']);
export type TypeOrdonnance = z.infer<typeof TypeOrdonnanceSchema>;

const MedecinSchema = z
  .object({
    id: z.number(),
    email: z.string(),
    first_name: z.string().default(''),
    last_name: z.string().default(''),
    numero_ordre: z.string().default(''),
  })
  .nullable();

export const OrdonnanceListItemSchema = z.object({
  id: z.number(),
  type_ordonnance: TypeOrdonnanceSchema,
  type_ordonnance_label: z.string(),
  generated_at: z.string(),
  validite_mois: z.number(),
  has_file: z.boolean(),
  medecin: MedecinSchema,
  prescription_data: z.record(z.unknown()).nullable().default({}),
  notes_generales: z.string().default(''),
  prochain_rdv: z.string().default(''),
});

export type OrdonnanceListItem = z.infer<typeof OrdonnanceListItemSchema>;

const OrdonnanceListSchema = z.array(OrdonnanceListItemSchema);

// ---------------------------------------------------------------------------
// Fetchers
// ---------------------------------------------------------------------------

const buildListUrl = (examType: 'adult' | 'child', examId: number): string =>
  examType === 'adult'
    ? `/depistage/examens/adultes/${examId}/ordonnances/`
    : `/depistage/examens/enfants/${examId}/ordonnances/`;

const getExamOrdonnances = async (
  examType: 'adult' | 'child',
  examId: number,
): Promise<OrdonnanceListItem[]> => {
  const raw = await api.get<unknown>(buildListUrl(examType, examId));
  return OrdonnanceListSchema.parse(raw);
};

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

/** Liste les ordonnances (0, 1 ou 2) liées à un examen. */
export const useExamOrdonnances = (
  examType: 'adult' | 'child',
  examId: number,
) =>
  useQuery({
    queryKey: ['ordonnances', examType, examId] as const,
    queryFn: () => getExamOrdonnances(examType, examId),
    enabled: examId > 0,
    retry: false,
  });

/** Récupère l'ordonnance d'un type donné (helper sur la liste). */
export const findOrdonnance = (
  list: OrdonnanceListItem[] | undefined,
  type: TypeOrdonnance,
): OrdonnanceListItem | undefined =>
  list?.find((o) => o.type_ordonnance === type);

/**
 * Télécharge une ordonnance par son ID global. Le nom de fichier renvoyé
 * par le backend (Content-Disposition) suit le pattern
 * ``ordonnance_{type.lower()}_{id:06d}.pdf`` — on respecte la même
 * convention côté client pour ne pas dépendre du parsing du header.
 */
export const useDownloadOrdonnance = () => {
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: ({
      ordonnanceId,
      typeOrdonnance,
    }: {
      ordonnanceId: number;
      typeOrdonnance: TypeOrdonnance;
    }) =>
      downloadPdf(
        `/depistage/ordonnances/${ordonnanceId}/download/`,
        `ordonnance_${typeOrdonnance.toLowerCase()}_${String(ordonnanceId).padStart(6, '0')}.pdf`,
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
