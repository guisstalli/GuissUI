import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsOverview } from '../types';
import { normalizeAnalyticsFilters } from '../utils/filters';

const buildOverviewUrl = (filters: AnalyticsFilters) => {
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
    ? `/api/v1/analytics/overview/?${queryString}`
    : '/api/v1/analytics/overview/';
};

export const getAnalyticsOverview = (
  filters: AnalyticsFilters,
): Promise<AnalyticsOverview> => {
  const normalizedFilters = normalizeAnalyticsFilters(filters);
  const endpoint = buildOverviewUrl(normalizedFilters);

  return api.get<AnalyticsOverview>(endpoint);
};

export const getAnalyticsOverviewQueryOptions = (filters: AnalyticsFilters) => {
  const normalizedFilters = normalizeAnalyticsFilters(filters);

  return queryOptions({
    queryKey: ['analytics', 'overview', normalizedFilters],
    queryFn: () => getAnalyticsOverview(normalizedFilters),
  });
};

type UseAnalyticsOverviewOptions = {
  filters: AnalyticsFilters;
  enabled?: boolean;
};

export const useAnalyticsOverview = ({
  filters,
  enabled = true,
}: UseAnalyticsOverviewOptions) => {
  return useQuery({
    ...getAnalyticsOverviewQueryOptions(filters),
    enabled,
  });
};
