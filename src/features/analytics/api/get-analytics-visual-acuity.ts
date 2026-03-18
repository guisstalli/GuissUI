import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsVisualAcuity } from '../types';
import { normalizeAnalyticsFilters } from '../utils/filters';

const buildVisualAcuityUrl = (filters: AnalyticsFilters) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (key === 'site_id' && Array.isArray(value)) {
      value.forEach((siteId) => {
        params.append('site_id', String(siteId));
      });
      return;
    }

    params.set(key, String(value));
  });

  const queryString = params.toString();
  return queryString
    ? `/api/v1/analytics/visual-acuity/?${queryString}`
    : '/api/v1/analytics/visual-acuity/';
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
