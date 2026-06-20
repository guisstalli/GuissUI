import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsRiskFactors } from '../types/types';
import {
  analyticsFiltersToSearchParams,
  normalizeAnalyticsFilters,
} from '../utils/filters';

const buildUrl = (filters: AnalyticsFilters) => {
  const qs = analyticsFiltersToSearchParams(filters).toString();
  return qs ? `/analytics/risk-factors/?${qs}` : '/analytics/risk-factors/';
};

export const getAnalyticsRiskFactors = (
  filters: AnalyticsFilters,
): Promise<AnalyticsRiskFactors> => {
  return api.get<AnalyticsRiskFactors>(
    buildUrl(normalizeAnalyticsFilters(filters)),
  );
};

export const getAnalyticsRiskFactorsQueryOptions = (
  filters: AnalyticsFilters,
) => {
  const normalized = normalizeAnalyticsFilters(filters);
  return queryOptions({
    queryKey: ['analytics', 'risk-factors', normalized],
    queryFn: () => getAnalyticsRiskFactors(normalized),
  });
};

type UseAnalyticsRiskFactorsOptions = {
  filters: AnalyticsFilters;
  enabled?: boolean;
};

export const useAnalyticsRiskFactors = ({
  filters,
  enabled = true,
}: UseAnalyticsRiskFactorsOptions) => {
  return useQuery({ ...getAnalyticsRiskFactorsQueryOptions(filters), enabled });
};
