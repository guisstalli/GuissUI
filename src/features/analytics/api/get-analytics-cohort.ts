import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { AnalyticsFilters, CohortResponse } from '../types/types';
import { normalizeAnalyticsFilters } from '../utils/filters';

const REPEATABLE_KEYS = new Set(['site_id', 'patient_ids']);

/**
 * Le endpoint cohorte est paginé (LimitOffsetPagination). On demande une page
 * large pour que la sélection, le « Tout sélectionner » et l'export CSV portent
 * sur l'intégralité de la cohorte d'un périmètre de dépistage (borné en pratique)
 * plutôt que sur la seule première page.
 */
export const COHORT_FETCH_LIMIT = 500;

const buildCohortUrl = (filters: AnalyticsFilters, limit?: number) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (REPEATABLE_KEYS.has(key) && Array.isArray(value)) {
      value.forEach((item) => {
        params.append(key, String(item));
      });
      return;
    }

    params.set(key, String(value));
  });

  if (limit !== undefined) {
    params.set('limit', String(limit));
  }

  const queryString = params.toString();
  return queryString
    ? `/analytics/cohort/?${queryString}`
    : '/analytics/cohort/';
};

export const getAnalyticsCohort = (
  filters: AnalyticsFilters,
  limit?: number,
): Promise<CohortResponse> => {
  const normalizedFilters = normalizeAnalyticsFilters(filters);
  const endpoint = buildCohortUrl(normalizedFilters, limit);

  return api.get<CohortResponse>(endpoint);
};

export const getAnalyticsCohortQueryOptions = (
  filters: AnalyticsFilters,
  limit?: number,
) => {
  const normalizedFilters = normalizeAnalyticsFilters(filters);

  return queryOptions({
    queryKey: ['analytics', 'cohort', normalizedFilters, limit ?? null],
    queryFn: () =>
      api.get<CohortResponse>(buildCohortUrl(normalizedFilters, limit)),
  });
};

type UseAnalyticsCohortOptions = {
  filters: AnalyticsFilters;
  enabled?: boolean;
  limit?: number;
};

export const useAnalyticsCohort = ({
  filters,
  enabled = true,
  limit,
}: UseAnalyticsCohortOptions) => {
  return useQuery({
    ...getAnalyticsCohortQueryOptions(filters, limit),
    enabled,
  });
};
