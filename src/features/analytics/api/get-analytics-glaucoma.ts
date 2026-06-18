import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsGlaucoma } from '../types/types';
import {
  analyticsFiltersToSearchParams,
  normalizeAnalyticsFilters,
} from '../utils/filters';

const buildGlaucomaUrl = (filters: AnalyticsFilters) => {
  const queryString = analyticsFiltersToSearchParams(filters).toString();
  return queryString
    ? `/analytics/glaucoma/?${queryString}`
    : '/analytics/glaucoma/';
};

export const getAnalyticsGlaucoma = (
  filters: AnalyticsFilters,
): Promise<AnalyticsGlaucoma> => {
  const normalizedFilters = normalizeAnalyticsFilters(filters);
  const endpoint = buildGlaucomaUrl(normalizedFilters);

  return api.get<AnalyticsGlaucoma>(endpoint);
};

export const getAnalyticsGlaucomaQueryOptions = (filters: AnalyticsFilters) => {
  const normalizedFilters = normalizeAnalyticsFilters(filters);

  return queryOptions({
    queryKey: ['analytics', 'glaucoma', normalizedFilters],
    queryFn: () => getAnalyticsGlaucoma(normalizedFilters),
  });
};

type UseAnalyticsGlaucomaOptions = {
  filters: AnalyticsFilters;
  enabled?: boolean;
};

export const useAnalyticsGlaucoma = ({
  filters,
  enabled = true,
}: UseAnalyticsGlaucomaOptions) => {
  return useQuery({
    ...getAnalyticsGlaucomaQueryOptions(filters),
    enabled,
  });
};
