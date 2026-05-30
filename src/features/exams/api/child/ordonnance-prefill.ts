import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { OrdonnancePrefill } from '../adult/ordonnance-prefill';

export type { OrdonnancePrefill };

const getChildOrdonnancePrefill = (
  examId: number,
): Promise<OrdonnancePrefill> =>
  api.get<OrdonnancePrefill>(
    `/depistage/examens/enfants/${examId}/ordonnance/prefill/`,
  );

export const getChildOrdonnancePrefillQueryOptions = (examId: number) =>
  queryOptions({
    queryKey: ['ordonnance-child-prefill', examId] as const,
    queryFn: () => getChildOrdonnancePrefill(examId),
    enabled: examId > 0,
    retry: false,
    staleTime: 5 * 60_000,
  });

export const useChildOrdonnancePrefill = (examId: number, enabled = true) =>
  useQuery({
    ...getChildOrdonnancePrefillQueryOptions(examId),
    enabled: enabled && examId > 0,
  });
