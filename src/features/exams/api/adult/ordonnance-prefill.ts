import { queryOptions, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';

const OrdonnancePrefillEyeSchema = z.object({
  sphere: z.number().nullable(),
  cylindre: z.number().nullable(),
  axe: z.number().nullable(),
});

const OrdonnancePrefillPatientSchema = z.object({
  name: z.string(),
  last_name: z.string(),
  full_name: z.string(),
  numero_identifiant: z.string(),
  date_de_naissance: z.string().nullable(),
  sex: z.string(),
});

const OrdonnancePrefillAcuiteSchema = z.object({
  avsc_od: z.number().nullable(),
  avsc_og: z.number().nullable(),
  avsc_odg: z.number().nullable(),
  avac_od: z.number().nullable(),
  avac_og: z.number().nullable(),
  avac_odg: z.number().nullable(),
  avac_od_prescrite: z.number().nullable(),
  avac_og_prescrite: z.number().nullable(),
  avac_odg_prescrite: z.number().nullable(),
});

const OrdonnancePrefillRefractionSchema = z.object({
  od: OrdonnancePrefillEyeSchema,
  og: OrdonnancePrefillEyeSchema,
  dp_loin: z.number().nullable(),
});

export const OrdonnancePrefillSchema = z.object({
  // Forme historique — rétro-compatible avec OrdonnanceFormDialog actuel
  od: OrdonnancePrefillEyeSchema,
  og: OrdonnancePrefillEyeSchema,
  dp_loin: z.number().nullable(),
  av_od: z.number().nullable(),
  av_og: z.number().nullable(),
  // Forme enrichie — plan §13.c
  patient: OrdonnancePrefillPatientSchema.nullable().optional(),
  date_consultation: z.string().nullable().optional(),
  acuite: OrdonnancePrefillAcuiteSchema.optional(),
  refraction: OrdonnancePrefillRefractionSchema.optional(),
});

export type OrdonnancePrefill = z.infer<typeof OrdonnancePrefillSchema>;

const getAdultOrdonnancePrefill = (
  examId: number,
): Promise<OrdonnancePrefill> =>
  api.get<OrdonnancePrefill>(
    `/depistage/examens/adultes/${examId}/ordonnance/prefill/`,
  );

export const getAdultOrdonnancePrefillQueryOptions = (examId: number) =>
  queryOptions({
    queryKey: ['ordonnance-adult-prefill', examId] as const,
    queryFn: () => getAdultOrdonnancePrefill(examId),
    enabled: examId > 0,
    retry: false,
    staleTime: 5 * 60_000,
  });

export const useAdultOrdonnancePrefill = (examId: number, enabled = true) =>
  useQuery({
    ...getAdultOrdonnancePrefillQueryOptions(examId),
    enabled: enabled && examId > 0,
  });
