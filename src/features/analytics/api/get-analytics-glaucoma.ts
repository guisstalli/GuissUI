import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsGlaucoma } from '../types';
import { normalizeAnalyticsFilters } from '../utils/filters';

const buildGlaucomaUrl = (filters: AnalyticsFilters) => {
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
    ? `/api/v1/analytics/glaucoma/?${queryString}`
    : '/api/v1/analytics/glaucoma/';
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
