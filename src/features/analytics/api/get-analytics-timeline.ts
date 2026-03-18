import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsTimeline } from '../types';
import { normalizeAnalyticsFilters } from '../utils/filters';

const buildTimelineUrl = (filters: AnalyticsFilters) => {
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
    ? `/api/v1/analytics/timeline/?${queryString}`
    : '/api/v1/analytics/timeline/';
};

export const getAnalyticsTimeline = (
  filters: AnalyticsFilters,
): Promise<AnalyticsTimeline> => {
  const normalizedFilters = normalizeAnalyticsFilters(filters);
  const endpoint = buildTimelineUrl(normalizedFilters);

  return api.get<AnalyticsTimeline>(endpoint);
};

export const getAnalyticsTimelineQueryOptions = (filters: AnalyticsFilters) => {
  const normalizedFilters = normalizeAnalyticsFilters(filters);

  return queryOptions({
    queryKey: ['analytics', 'timeline', normalizedFilters],
    queryFn: () => getAnalyticsTimeline(normalizedFilters),
  });
};

type UseAnalyticsTimelineOptions = {
  filters: AnalyticsFilters;
  enabled?: boolean;
};

export const useAnalyticsTimeline = ({
  filters,
  enabled = true,
}: UseAnalyticsTimelineOptions) => {
  return useQuery({
    ...getAnalyticsTimelineQueryOptions(filters),
    enabled,
  });
};
