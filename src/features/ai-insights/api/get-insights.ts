import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { DjangoPaginatedResponse } from '@/types/api';

import type { Insight } from '../types';

export type InsightListParams = {
  limit?: number;
  offset?: number;
  active?: boolean;
};

export const getInsights = (
  params: InsightListParams = {},
): Promise<DjangoPaginatedResponse<Insight>> =>
  api.get('/ai-reports/insights/', { params });

export const getInsightsQueryOptions = (params: InsightListParams = {}) =>
  queryOptions({
    queryKey: ['ai-insights', 'rules', params],
    queryFn: () => getInsights(params),
  });

export const useInsights = (params: InsightListParams = {}) =>
  useQuery(getInsightsQueryOptions(params));
