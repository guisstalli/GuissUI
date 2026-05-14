import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type {
  AnalyticsDriverExperience,
  AnalyticsFilters,
} from '../types';
import { normalizeAnalyticsFilters } from '../utils/filters';

const buildUrl = (filters: AnalyticsFilters) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (key === 'site_id' && Array.isArray(value)) {
      value.forEach((id) => params.append('site_id', String(id)));
      return;
    }
    params.set(key, String(value));
  });
  const qs = params.toString();
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
