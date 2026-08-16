import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { CapabilityRegistryItem } from '../types/schemas';

export const getCapabilityRegistry = (): Promise<CapabilityRegistryItem[]> =>
  api.get('/users/capabilities/');

export const getCapabilityRegistryQueryOptions = () =>
  queryOptions({
    queryKey: ['capability-registry'],
    queryFn: getCapabilityRegistry,
    // Registre quasi-statique côté backend — cache agressif justifié.
    staleTime: 5 * 60 * 1000,
  });

export const useCapabilityRegistry = () =>
  useQuery(getCapabilityRegistryQueryOptions());
