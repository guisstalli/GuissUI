import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsVisualField } from '../types';
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
  return qs ? `/analytics/visual-field/?${qs}` : '/analytics/visual-field/';
};

export const getAnalyticsVisualField = (
  filters: AnalyticsFilters,
): Promise<AnalyticsVisualField> => {
  return api.get<AnalyticsVisualField>(
    buildUrl(normalizeAnalyticsFilters(filters)),
  );
};

export const getAnalyticsVisualFieldQueryOptions = (
  filters: AnalyticsFilters,
) => {
  const normalized = normalizeAnalyticsFilters(filters);
  return queryOptions({
    queryKey: ['analytics', 'visual-field', normalized],
    queryFn: () => getAnalyticsVisualField(normalized),
  });
};

type UseAnalyticsVisualFieldOptions = {
  filters: AnalyticsFilters;
  enabled?: boolean;
};

export const useAnalyticsVisualField = ({
  filters,
  enabled = true,
}: UseAnalyticsVisualFieldOptions) => {
  return useQuery({ ...getAnalyticsVisualFieldQueryOptions(filters), enabled });
};
