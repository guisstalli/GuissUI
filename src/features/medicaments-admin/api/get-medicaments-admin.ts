import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { FormeGalenique, PaginatedMedicaments } from '../types/schemas';

interface ListParams {
  q?: string;
  forme?: FormeGalenique;
  actif?: boolean;
  limit?: number;
  offset?: number;
}

const getMedicamentsAdmin = (
  params: ListParams = {},
): Promise<PaginatedMedicaments> =>
  api.get<PaginatedMedicaments>('/depistage/medicaments/', {
    params: {
      ...(params.q ? { q: params.q } : {}),
      ...(params.forme ? { forme: params.forme } : {}),
      ...(params.actif !== undefined ? { actif: params.actif } : {}),
      limit: params.limit ?? 20,
      offset: params.offset ?? 0,
    },
  });

export const getMedicamentsAdminQueryOptions = (params: ListParams = {}) =>
  queryOptions({
    queryKey: ['medicaments-admin', params],
    queryFn: () => getMedicamentsAdmin(params),
    staleTime: 30_000,
  });

export const useMedicamentsAdmin = (params: ListParams = {}) =>
  useQuery(getMedicamentsAdminQueryOptions(params));
