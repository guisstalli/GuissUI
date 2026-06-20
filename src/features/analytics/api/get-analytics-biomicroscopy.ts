import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsBiomicroscopy, AnalyticsFilters } from '../types/types';
import {
  analyticsFiltersToSearchParams,
  normalizeAnalyticsFilters,
} from '../utils/filters';

const buildUrl = (filters: AnalyticsFilters) => {
  const qs = analyticsFiltersToSearchParams(filters).toString();
  return qs ? `/analytics/biomicroscopy/?${qs}` : '/analytics/biomicroscopy/';
};

export const getAnalyticsBiomicroscopy = (
  filters: AnalyticsFilters,
): Promise<AnalyticsBiomicroscopy> => {
  return api.get<AnalyticsBiomicroscopy>(
    buildUrl(normalizeAnalyticsFilters(filters)),
  );
};

export const getAnalyticsBiomicroscopyQueryOptions = (
  filters: AnalyticsFilters,
) => {
  const normalized = normalizeAnalyticsFilters(filters);
  return queryOptions({
    queryKey: ['analytics', 'biomicroscopy', normalized],
    queryFn: () => getAnalyticsBiomicroscopy(normalized),
  });
};

type UseAnalyticsBiomicroscopyOptions = {
  filters: AnalyticsFilters;
  enabled?: boolean;
};

export const useAnalyticsBiomicroscopy = ({
  filters,
  enabled = true,
}: UseAnalyticsBiomicroscopyOptions) => {
  return useQuery({
    ...getAnalyticsBiomicroscopyQueryOptions(filters),
    enabled,
  });
};
