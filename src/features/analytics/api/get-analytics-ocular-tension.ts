import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsOcularTension } from '../types';
import { normalizeAnalyticsFilters } from '../utils/filters';

const buildOcularTensionUrl = (filters: AnalyticsFilters) => {
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
    ? `/api/v1/analytics/ocular-tension/?${queryString}`
    : '/api/v1/analytics/ocular-tension/';
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
