import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsSymptomsFull } from '../types';
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
  return qs ? `/analytics/symptoms-full/?${qs}` : '/analytics/symptoms-full/';
};

export const getAnalyticsSymptomsFull = (
  filters: AnalyticsFilters,
): Promise<AnalyticsSymptomsFull> => {
  return api.get<AnalyticsSymptomsFull>(buildUrl(normalizeAnalyticsFilters(filters)));
};

export const getAnalyticsSymptomsFullQueryOptions = (
  filters: AnalyticsFilters,
) => {
  const normalized = normalizeAnalyticsFilters(filters);
  return queryOptions({
    queryKey: ['analytics', 'symptoms-full', normalized],
    queryFn: () => getAnalyticsSymptomsFull(normalized),
  });
};

type UseAnalyticsSymptomsFullOptions = {
  filters: AnalyticsFilters;
  enabled?: boolean;
};

export const useAnalyticsSymptomsFull = ({
  filters,
  enabled = true,
}: UseAnalyticsSymptomsFullOptions) => {
  return useQuery({ ...getAnalyticsSymptomsFullQueryOptions(filters), enabled });
};
