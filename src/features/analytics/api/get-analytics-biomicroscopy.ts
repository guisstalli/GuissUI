import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsBiomicroscopy, AnalyticsFilters } from '../types';
import { normalizeAnalyticsFilters } from '../utils/filters';

const buildUrl = (filters: AnalyticsFilters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (key === 'site_id' && Array.isArray(value)) {
      value.forEach((id) => params.append('site_id', String(id)));
      return;
    }
    params.set(key, String(value));
  });
  const qs = params.toString();
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
