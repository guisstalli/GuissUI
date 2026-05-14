import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Prestation } from '../types/schemas';

const getPrestations = (): Promise<Prestation[]> =>
  api.get('/billing/prestations/');

export const getPrestationsQueryOptions = () =>
  queryOptions({
    queryKey: ['prestations'],
    queryFn: getPrestations,
    staleTime: 5 * 60 * 1000, // 5 minutes — catalogue changes rarely
  });

export const usePrestations = () => useQuery(getPrestationsQueryOptions());
