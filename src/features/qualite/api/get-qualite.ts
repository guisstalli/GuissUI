import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { FiltresQualite, RegleQualite } from '../types/types';

const construireUrl = (base: string, filtres: FiltresQualite) => {
  const params = new URLSearchParams();
  if (filtres.dateDebut) params.set('date_debut', filtres.dateDebut);
  if (filtres.dateFin) params.set('date_fin', filtres.dateFin);
  const chaine = params.toString();
  return chaine ? `${base}?${chaine}` : base;
};

export const getQualite = (filtres: FiltresQualite): Promise<RegleQualite[]> =>
  api.get<RegleQualite[]>(construireUrl('/analytics/qualite/', filtres));

export const getQualiteQueryOptions = (filtres: FiltresQualite) =>
  queryOptions({
    queryKey: ['qualite', 'synthese', filtres],
    queryFn: () => getQualite(filtres),
  });

export const useQualite = (filtres: FiltresQualite = {}) =>
  useQuery(getQualiteQueryOptions(filtres));
