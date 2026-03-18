import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsRefraction } from '../types';
import { normalizeAnalyticsFilters } from '../utils/filters';

const buildRefractionUrl = (filters: AnalyticsFilters) => {
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
    ? `/api/v1/analytics/refraction/?${queryString}`
    : '/api/v1/analytics/refraction/';
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
