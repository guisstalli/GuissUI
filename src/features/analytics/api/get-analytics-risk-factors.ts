import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, AnalyticsRiskFactors } from '../types';
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
