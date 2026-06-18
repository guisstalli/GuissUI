import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { RdvStats } from '../types/schemas';

const getRdvStats = (): Promise<RdvStats> =>
  api.get('/rendez-vous/statistiques/');

export const getRdvStatsQueryOptions = () =>
  queryOptions({ queryKey: ['rdv-stats'], queryFn: getRdvStats });

export const useRdvStats = () => useQuery(getRdvStatsQueryOptions());
