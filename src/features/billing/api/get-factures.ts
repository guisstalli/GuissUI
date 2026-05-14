import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { PaginatedFactures } from '../types/schemas';

export type FacturesQueryParams = {
  limit?: number;
  offset?: number;
  statut?: string;
  search?: string;
  rendez_vous_id?: number;
};

const getFactures = (
  params?: FacturesQueryParams,
): Promise<PaginatedFactures> => api.get('/billing/factures/', { params });

export const getFacturesQueryOptions = (params?: FacturesQueryParams) =>
  queryOptions({
    queryKey: ['factures', params],
    queryFn: () => getFactures(params),
  });

export const useFactures = ({
  params,
}: { params?: FacturesQueryParams } = {}) =>
  useQuery(getFacturesQueryOptions(params));
