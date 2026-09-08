import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Arbitrage, StatutArbitrage } from '../types/types';

type FiltresArbitrage = {
  statut?: StatutArbitrage;
  jour?: string;
};

const construireUrl = (filtres: FiltresArbitrage) => {
  const params = new URLSearchParams();
  if (filtres.statut) params.set('statut', filtres.statut);
  if (filtres.jour) params.set('jour', filtres.jour);
  const chaine = params.toString();
  return chaine ? `/analytics/arbitrages/?${chaine}` : '/analytics/arbitrages/';
};

export const getArbitrages = (
  filtres: FiltresArbitrage,
): Promise<Arbitrage[]> => api.get<Arbitrage[]>(construireUrl(filtres));

export const getArbitragesQueryOptions = (filtres: FiltresArbitrage) =>
  queryOptions({
    queryKey: ['qualite', 'arbitrages', filtres],
    queryFn: () => getArbitrages(filtres),
  });

export const useArbitrages = (filtres: FiltresArbitrage = {}) =>
  useQuery(getArbitragesQueryOptions(filtres));
