import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsSites } from '../types/types';
import {
  analyticsFiltersToSearchParams,
  normalizeAnalyticsFilters,
} from '../utils/filters';

const buildSitesUrl = (filters: AnalyticsFilters) => {
  const queryString = analyticsFiltersToSearchParams(filters).toString();
  return queryString ? `/analytics/sites/?${queryString}` : '/analytics/sites/';
};

export const getAnalyticsSites = (
  filters: AnalyticsFilters,
): Promise<AnalyticsSites> => {
  const normalizedFilters = normalizeAnalyticsFilters(filters);
  const endpoint = buildSitesUrl(normalizedFilters);

  return api.get<AnalyticsSites>(endpoint);
};

export const getAnalyticsSitesQueryOptions = (filters: AnalyticsFilters) => {
  const normalizedFilters = normalizeAnalyticsFilters(filters);

  return queryOptions({
    queryKey: ['analytics', 'sites', normalizedFilters],
    queryFn: () => getAnalyticsSites(normalizedFilters),
  });
};

type UseAnalyticsSitesOptions = {
  filters: AnalyticsFilters;
  enabled?: boolean;
};

export const useAnalyticsSites = ({
  filters,
  enabled = true,
}: UseAnalyticsSitesOptions) => {
  return useQuery({
    ...getAnalyticsSitesQueryOptions(filters),
    enabled,
  });
};
