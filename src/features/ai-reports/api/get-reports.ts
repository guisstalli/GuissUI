import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { DjangoPaginatedResponse } from '@/types/api';

import type { ReportListItem } from '../types';

export type ReportListParams = {
  limit?: number;
  offset?: number;
  status?: string;
  report_type?: string;
  /** AAAA-MM-JJ */
  date_from?: string;
  /** AAAA-MM-JJ */
  date_to?: string;
};

export const getReports = (
  params: ReportListParams = {},
): Promise<DjangoPaginatedResponse<ReportListItem>> =>
  api.get('/ai-reports/', { params });

export const getReportsQueryOptions = (params: ReportListParams = {}) =>
  queryOptions({
    queryKey: ['ai-reports', params],
    queryFn: () => getReports(params),
  });

export const useReports = ({
  params,
  enabled = true,
}: {
  params?: ReportListParams;
  enabled?: boolean;
} = {}) => useQuery({ ...getReportsQueryOptions(params ?? {}), enabled });
