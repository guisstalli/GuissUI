import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Prestation } from '../types/schemas';

/** Enveloppe LimitOffsetPagination du backend (get_paginated_response). */
type PaginatedPrestations = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Prestation[];
};

// L'endpoint est PAGINÉ : on déplie `.results` pour exposer un tableau plat
// (sinon `.length`/`.map` opèrent sur l'enveloppe → « undefined »).
const getPrestations = async (): Promise<Prestation[]> => {
  const res = await api.get<PaginatedPrestations>(
    '/billing/prestations/?limit=200',
  );
  return res.results ?? [];
};

export const getPrestationsQueryOptions = () =>
  queryOptions({
    queryKey: ['prestations'],
    queryFn: getPrestations,
    staleTime: 5 * 60 * 1000, // 5 minutes — catalogue changes rarely
  });

export const usePrestations = () => useQuery(getPrestationsQueryOptions());
