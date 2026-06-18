import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsOcularTension } from '../types/types';
import {
  analyticsFiltersToSearchParams,
  normalizeAnalyticsFilters,
} from '../utils/filters';

const buildOcularTensionUrl = (filters: AnalyticsFilters) => {
  const queryString = analyticsFiltersToSearchParams(filters).toString();
  return queryString
    ? `/analytics/ocular-tension/?${queryString}`
    : '/analytics/ocular-tension/';
};

export const getAnalyticsOcularTension = (
  filters: AnalyticsFilters,
): Promise<AnalyticsOcularTension> => {
  const normalizedFilters = normalizeAnalyticsFilters(filters);
  const endpoint = buildOcularTensionUrl(normalizedFilters);

  return api.get<AnalyticsOcularTension>(endpoint);
};

export const getAnalyticsOcularTensionQueryOptions = (
  filters: AnalyticsFilters,
) => {
  const normalizedFilters = normalizeAnalyticsFilters(filters);

  return queryOptions({
    queryKey: ['analytics', 'ocular-tension', normalizedFilters],
    queryFn: () => getAnalyticsOcularTension(normalizedFilters),
  });
};

type UseAnalyticsOcularTensionOptions = {
  filters: AnalyticsFilters;
  enabled?: boolean;
};

export const useAnalyticsOcularTension = ({
  filters,
  enabled = true,
}: UseAnalyticsOcularTensionOptions) => {
  return useQuery({
    ...getAnalyticsOcularTensionQueryOptions(filters),
    enabled,
  });
};
