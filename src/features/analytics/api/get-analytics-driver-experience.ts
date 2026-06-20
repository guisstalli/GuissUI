import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type {
  AnalyticsDriverExperience,
  AnalyticsFilters,
} from '../types/types';
import {
  analyticsFiltersToSearchParams,
  normalizeAnalyticsFilters,
} from '../utils/filters';

const buildUrl = (filters: AnalyticsFilters) => {
  const qs = analyticsFiltersToSearchParams(filters).toString();
  return qs
    ? `/analytics/driver-experience/?${qs}`
    : '/analytics/driver-experience/';
};

export const getAnalyticsDriverExperience = (
  filters: AnalyticsFilters,
): Promise<AnalyticsDriverExperience> => {
  return api.get<AnalyticsDriverExperience>(
    buildUrl(normalizeAnalyticsFilters(filters)),
  );
};

export const getAnalyticsDriverExperienceQueryOptions = (
  filters: AnalyticsFilters,
) => {
  const normalized = normalizeAnalyticsFilters(filters);
  return queryOptions({
    queryKey: ['analytics', 'driver-experience', normalized],
    queryFn: () => getAnalyticsDriverExperience(normalized),
  });
};

type UseAnalyticsDriverExperienceOptions = {
  filters: AnalyticsFilters;
  enabled?: boolean;
};

export const useAnalyticsDriverExperience = ({
  filters,
  enabled = true,
}: UseAnalyticsDriverExperienceOptions) => {
  return useQuery({
    ...getAnalyticsDriverExperienceQueryOptions(filters),
    enabled,
  });
};
