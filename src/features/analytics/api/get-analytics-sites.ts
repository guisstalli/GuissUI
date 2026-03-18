import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsSites } from '../types';
import { normalizeAnalyticsFilters } from '../utils/filters';

const buildSitesUrl = (filters: AnalyticsFilters) => {
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
    ? `/api/v1/analytics/sites/?${queryString}`
    : '/api/v1/analytics/sites/';
};

export const getAnalyticsSites = (
  filters: AnalyticsFilters,
): Promise<AnalyticsSites> => {
  const normalizedFilters = normalizeAnalyticsFilters(filters);
  const endpoint = buildSitesUrl(normalizedFilters);

  return api.get<AnalyticsSites>(endpoint);
};

export const getAnalyticsSitesQueryOptions = (filters: AnalyticsFilters) => {
  const normalizedFilters = normalizeAnalyticsFilters(filters);

  return queryOptions({
    queryKey: ['analytics', 'sites', normalizedFilters],
    queryFn: () => getAnalyticsSites(normalizedFilters),
  });
};

type UseAnalyticsSitesOptions = {
  filters: AnalyticsFilters;
  enabled?: boolean;
};

export const useAnalyticsSites = ({
  filters,
  enabled = true,
}: UseAnalyticsSitesOptions) => {
  return useQuery({
    ...getAnalyticsSitesQueryOptions(filters),
    enabled,
  });
};
