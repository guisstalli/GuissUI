import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

export type RdvStats = {
  en_attente: number;
  confirme: number;
  present: number;
  absent: number;
  annule: number;
};

const getRdvStats = (): Promise<RdvStats> =>
  api.get('/rendez-vous/statistiques/');

export const getRdvStatsQueryOptions = () =>
  queryOptions({ queryKey: ['rdv-stats'], queryFn: getRdvStats });

export const useRdvStats = () => useQuery(getRdvStatsQueryOptions());
