import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsOverview } from '../types/types';
import {
  analyticsFiltersToSearchParams,
  normalizeAnalyticsFilters,
} from '../utils/filters';

const buildOverviewUrl = (filters: AnalyticsFilters) => {
  const queryString = analyticsFiltersToSearchParams(filters).toString();
  return queryString
    ? `/analytics/overview/?${queryString}`
    : '/analytics/overview/';
};

export const getAnalyticsOverview = (
  filters: AnalyticsFilters,
): Promise<AnalyticsOverview> => {
  const normalizedFilters = normalizeAnalyticsFilters(filters);
  const endpoint = buildOverviewUrl(normalizedFilters);

  return api.get<AnalyticsOverview>(endpoint);
};

export const getAnalyticsOverviewQueryOptions = (filters: AnalyticsFilters) => {
  const normalizedFilters = normalizeAnalyticsFilters(filters);

  return queryOptions({
    queryKey: ['analytics', 'overview', normalizedFilters],
    queryFn: () => getAnalyticsOverview(normalizedFilters),
  });
};

type UseAnalyticsOverviewOptions = {
  filters: AnalyticsFilters;
  enabled?: boolean;
};

export const useAnalyticsOverview = ({
  filters,
  enabled = true,
}: UseAnalyticsOverviewOptions) => {
  return useQuery({
    ...getAnalyticsOverviewQueryOptions(filters),
    enabled,
  });
};
