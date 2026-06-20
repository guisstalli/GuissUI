import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsPachymetry } from '../types/types';
import {
  analyticsFiltersToSearchParams,
  normalizeAnalyticsFilters,
} from '../utils/filters';

const buildPachymetryUrl = (filters: AnalyticsFilters) => {
  const queryString = analyticsFiltersToSearchParams(filters).toString();
  return queryString
    ? `/analytics/pachymetry/?${queryString}`
    : '/analytics/pachymetry/';
};

export const getAnalyticsPachymetry = (
  filters: AnalyticsFilters,
): Promise<AnalyticsPachymetry> => {
  const normalizedFilters = normalizeAnalyticsFilters(filters);
  const endpoint = buildPachymetryUrl(normalizedFilters);

  return api.get<AnalyticsPachymetry>(endpoint);
};

export const getAnalyticsPachymetryQueryOptions = (
  filters: AnalyticsFilters,
) => {
  const normalizedFilters = normalizeAnalyticsFilters(filters);

  return queryOptions({
    queryKey: ['analytics', 'pachymetry', normalizedFilters],
    queryFn: () => getAnalyticsPachymetry(normalizedFilters),
  });
};

type UseAnalyticsPachymetryOptions = {
  filters: AnalyticsFilters;
  enabled?: boolean;
};

export const useAnalyticsPachymetry = ({
  filters,
  enabled = true,
}: UseAnalyticsPachymetryOptions) => {
  return useQuery({
    ...getAnalyticsPachymetryQueryOptions(filters),
    enabled,
  });
};
