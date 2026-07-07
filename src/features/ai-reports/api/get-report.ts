import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { ReportDetail } from '../types';

export const getReport = (reportId: number): Promise<ReportDetail> =>
  api.get(`/ai-reports/${reportId}/`);

export const getReportQueryOptions = (reportId: number) =>
  queryOptions({
    queryKey: ['ai-reports', 'detail', reportId],
    queryFn: () => getReport(reportId),
  });

/** Lecture simple, sans polling — voir hooks/use-report-polling pour le suivi
 *  d'une génération en cours. */
export const useReport = (
  reportId: number,
  { enabled = true }: { enabled?: boolean } = {},
) => useQuery({ ...getReportQueryOptions(reportId), enabled });
