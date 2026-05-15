import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { RdvConfig } from '../types/schemas';

const getConfig = (): Promise<RdvConfig> => api.get('/rendez-vous/config/');

export const getConfigQueryOptions = () =>
  queryOptions({ queryKey: ['rdv-config'], queryFn: getConfig });

export const useRdvConfig = () => useQuery(getConfigQueryOptions());
