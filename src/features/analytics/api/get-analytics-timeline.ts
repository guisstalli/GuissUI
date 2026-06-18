import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsTimeline } from '../types/types';
import {
  analyticsFiltersToSearchParams,
  normalizeAnalyticsFilters,
} from '../utils/filters';

const buildTimelineUrl = (filters: AnalyticsFilters) => {
  const queryString = analyticsFiltersToSearchParams(filters).toString();
  return queryString
    ? `/analytics/timeline/?${queryString}`
    : '/analytics/timeline/';
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
