import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsSymptomsFull } from '../types/types';
import {
  analyticsFiltersToSearchParams,
  normalizeAnalyticsFilters,
} from '../utils/filters';

const buildUrl = (filters: AnalyticsFilters) => {
  const qs = analyticsFiltersToSearchParams(filters).toString();
  return qs ? `/analytics/symptoms-full/?${qs}` : '/analytics/symptoms-full/';
};

export const getAnalyticsSymptomsFull = (
  filters: AnalyticsFilters,
): Promise<AnalyticsSymptomsFull> => {
  return api.get<AnalyticsSymptomsFull>(
    buildUrl(normalizeAnalyticsFilters(filters)),
  );
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
  return useQuery({
    ...getAnalyticsSymptomsFullQueryOptions(filters),
    enabled,
  });
};
