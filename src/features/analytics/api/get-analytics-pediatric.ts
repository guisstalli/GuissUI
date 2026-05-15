import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsPediatric } from '../types';
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
