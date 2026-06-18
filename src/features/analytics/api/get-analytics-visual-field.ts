import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsVisualField } from '../types/types';
import {
  analyticsFiltersToSearchParams,
  normalizeAnalyticsFilters,
} from '../utils/filters';

const buildUrl = (filters: AnalyticsFilters) => {
  const qs = analyticsFiltersToSearchParams(filters).toString();
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
