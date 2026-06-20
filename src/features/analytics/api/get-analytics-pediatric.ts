import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsPediatric } from '../types/types';
import {
  analyticsFiltersToSearchParams,
  normalizeAnalyticsFilters,
} from '../utils/filters';

const buildUrl = (filters: AnalyticsFilters) => {
  const qs = analyticsFiltersToSearchParams(filters).toString();
  return qs ? `/analytics/pediatric/?${qs}` : '/analytics/pediatric/';
};

export const getAnalyticsPediatric = (
  filters: AnalyticsFilters,
): Promise<AnalyticsPediatric> => {
  return api.get<AnalyticsPediatric>(
    buildUrl(normalizeAnalyticsFilters(filters)),
  );
};

export const getAnalyticsPediatricQueryOptions = (
  filters: AnalyticsFilters,
) => {
  const normalized = normalizeAnalyticsFilters(filters);
  return queryOptions({
    queryKey: ['analytics', 'pediatric', normalized],
    queryFn: () => getAnalyticsPediatric(normalized),
  });
};

type UseAnalyticsPediatricOptions = {
  filters: AnalyticsFilters;
  enabled?: boolean;
};

export const useAnalyticsPediatric = ({
  filters,
  enabled = true,
}: UseAnalyticsPediatricOptions) => {
  return useQuery({ ...getAnalyticsPediatricQueryOptions(filters), enabled });
};
