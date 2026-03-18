import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsPachymetry } from '../types';
import { normalizeAnalyticsFilters } from '../utils/filters';

const buildPachymetryUrl = (filters: AnalyticsFilters) => {
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
    ? `/api/v1/analytics/pachymetry/?${queryString}`
    : '/api/v1/analytics/pachymetry/';
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
