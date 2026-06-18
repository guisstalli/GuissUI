import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Disponibilites } from '../types/schemas';

export const getDisponibilites = (date: string): Promise<Disponibilites> =>
  api.get('/rendez-vous/disponibilites/', { params: { date } });

export const getDisponibilitesQueryOptions = (date: string) =>
  queryOptions({
    queryKey: ['rdv', 'disponibilites', date],
    queryFn: () => getDisponibilites(date),
    staleTime: 30_000,
  });

export const useDisponibilites = (date: string | null) =>
  useQuery({
    ...getDisponibilitesQueryOptions(date ?? ''),
    enabled: !!date,
  });
