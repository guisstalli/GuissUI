import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Facture } from '../types/schemas';

const getFacture = (id: number): Promise<Facture> =>
  api.get(`/billing/factures/${id}/`);

export const getFactureQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ['factures', id],
    queryFn: () => getFacture(id),
    enabled: !!id,
  });

export const useFacture = (id: number) => useQuery(getFactureQueryOptions(id));
