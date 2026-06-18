import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsRefraction } from '../types/types';
import {
  analyticsFiltersToSearchParams,
  normalizeAnalyticsFilters,
} from '../utils/filters';

const buildRefractionUrl = (filters: AnalyticsFilters) => {
  const queryString = analyticsFiltersToSearchParams(filters).toString();
  return queryString
    ? `/analytics/refraction/?${queryString}`
    : '/analytics/refraction/';
};

export const getAnalyticsRefraction = (
  filters: AnalyticsFilters,
): Promise<AnalyticsRefraction> => {
  const normalizedFilters = normalizeAnalyticsFilters(filters);
  const endpoint = buildRefractionUrl(normalizedFilters);

  return api.get<AnalyticsRefraction>(endpoint);
};

export const getAnalyticsRefractionQueryOptions = (
  filters: AnalyticsFilters,
) => {
  const normalizedFilters = normalizeAnalyticsFilters(filters);

  return queryOptions({
    queryKey: ['analytics', 'refraction', normalizedFilters],
    queryFn: () => getAnalyticsRefraction(normalizedFilters),
  });
};

type UseAnalyticsRefractionOptions = {
  filters: AnalyticsFilters;
  enabled?: boolean;
};

export const useAnalyticsRefraction = ({
  filters,
  enabled = true,
}: UseAnalyticsRefractionOptions) => {
  return useQuery({
    ...getAnalyticsRefractionQueryOptions(filters),
    enabled,
  });
};
