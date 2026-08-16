import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Capability } from '../types';

export const getCapabilities = (): Promise<Capability[]> =>
  api.get('/ai/capabilities/');

export const getCapabilitiesQueryOptions = () =>
  queryOptions({
    queryKey: ['ai-capabilities'],
    queryFn: getCapabilities,
    // Quasi-statique (recettes YAML côté backend) — cache agressif justifié.
    staleTime: 5 * 60 * 1000,
  });

export const useCapabilities = ({
  enabled = true,
}: { enabled?: boolean } = {}) =>
  useQuery({ ...getCapabilitiesQueryOptions(), enabled });
