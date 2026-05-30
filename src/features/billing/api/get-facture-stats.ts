import { queryOptions, useQuery } from '@tanstack/react-query';
import { z } from 'zod';

import { api } from '@/lib/api-client';

export const factureStatsSchema = z.object({
  total: z.number(),
  brouillon: z.number(),
  emise: z.number(),
  payee: z.number(),
  annulee: z.number(),
  montant_total_emis: z.string(),
  montant_total_paye: z.string(),
  solde_du: z.string(),
});

export type FactureStats = z.infer<typeof factureStatsSchema>;

export type FactureStatsParams = {
  site_id?: number;
  date_start?: string;
  date_end?: string;
};

const getFactureStats = (params?: FactureStatsParams): Promise<FactureStats> =>
  api.get('/billing/factures/stats/', { params });

export const getFactureStatsQueryOptions = (params?: FactureStatsParams) =>
  queryOptions({
    queryKey: ['facture-stats', params],
    queryFn: () => getFactureStats(params),
  });

export const useFactureStats = ({
  params,
}: { params?: FactureStatsParams } = {}) =>
  useQuery(getFactureStatsQueryOptions(params));
