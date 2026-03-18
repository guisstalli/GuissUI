import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsSymptoms } from '../types';
import { normalizeAnalyticsFilters } from '../utils/filters';

const buildSymptomsUrl = (filters: AnalyticsFilters) => {
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
    ? `/api/v1/analytics/symptoms-diagnostics/?${queryString}`
    : '/api/v1/analytics/symptoms-diagnostics/';
};

export const getAnalyticsSymptoms = (
  filters: AnalyticsFilters,
): Promise<AnalyticsSymptoms> => {
  const normalizedFilters = normalizeAnalyticsFilters(filters);
  const endpoint = buildSymptomsUrl(normalizedFilters);

  return api.get<AnalyticsSymptoms>(endpoint);
};

export const getAnalyticsSymptomsQueryOptions = (filters: AnalyticsFilters) => {
  const normalizedFilters = normalizeAnalyticsFilters(filters);

  return queryOptions({
    queryKey: ['analytics', 'symptoms', normalizedFilters],
    queryFn: () => getAnalyticsSymptoms(normalizedFilters),
  });
};

type UseAnalyticsSymptomsOptions = {
  filters: AnalyticsFilters;
  enabled?: boolean;
};

export const useAnalyticsSymptoms = ({
  filters,
  enabled = true,
}: UseAnalyticsSymptomsOptions) => {
  return useQuery({
    ...getAnalyticsSymptomsQueryOptions(filters),
    enabled,
  });
};
