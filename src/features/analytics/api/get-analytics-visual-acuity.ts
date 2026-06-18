import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsVisualAcuity } from '../types/types';
import {
  analyticsFiltersToSearchParams,
  normalizeAnalyticsFilters,
} from '../utils/filters';

const buildVisualAcuityUrl = (filters: AnalyticsFilters) => {
  const queryString = analyticsFiltersToSearchParams(filters).toString();
  return queryString
    ? `/analytics/visual-acuity/?${queryString}`
    : '/analytics/visual-acuity/';
};

export const getAnalyticsVisualAcuity = (
  filters: AnalyticsFilters,
): Promise<AnalyticsVisualAcuity> => {
  const normalizedFilters = normalizeAnalyticsFilters(filters);
  const endpoint = buildVisualAcuityUrl(normalizedFilters);

  return api.get<AnalyticsVisualAcuity>(endpoint);
};

export const getAnalyticsVisualAcuityQueryOptions = (
  filters: AnalyticsFilters,
) => {
  const normalizedFilters = normalizeAnalyticsFilters(filters);

  return queryOptions({
    queryKey: ['analytics', 'visual-acuity', normalizedFilters],
    queryFn: () => getAnalyticsVisualAcuity(normalizedFilters),
  });
};

type UseAnalyticsVisualAcuityOptions = {
  filters: AnalyticsFilters;
  enabled?: boolean;
};

export const useAnalyticsVisualAcuity = ({
  filters,
  enabled = true,
}: UseAnalyticsVisualAcuityOptions) => {
  return useQuery({
    ...getAnalyticsVisualAcuityQueryOptions(filters),
    enabled,
  });
};
