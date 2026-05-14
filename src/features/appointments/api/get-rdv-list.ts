import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { PaginatedRdv } from '../types/schemas';

interface GetRdvListParams {
  statut?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
  offset?: number;
}

export const getRdvList = (
  params: GetRdvListParams = {},
): Promise<PaginatedRdv> =>
  api.get('/rendez-vous/', {
    params: params as Record<
      string,
      string | number | boolean | undefined | null
    >,
  });

export const useRdvList = (params: GetRdvListParams = {}) =>
  useQuery({
    queryKey: ['rdv', 'list', params],
    queryFn: () => getRdvList(params),
    staleTime: 30_000,
  });
