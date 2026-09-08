import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Doublon, FiltresQualite } from '../types/types';

const construireUrl = (filtres: FiltresQualite) => {
  const params = new URLSearchParams();
  if (filtres.dateDebut) params.set('date_debut', filtres.dateDebut);
  if (filtres.dateFin) params.set('date_fin', filtres.dateFin);
  const chaine = params.toString();
  return chaine
    ? `/analytics/qualite/doublons/?${chaine}`
    : '/analytics/qualite/doublons/';
};

export const getDoublons = (filtres: FiltresQualite): Promise<Doublon[]> =>
  api.get<Doublon[]>(construireUrl(filtres));

export const getDoublonsQueryOptions = (filtres: FiltresQualite) =>
  queryOptions({
    queryKey: ['qualite', 'doublons', filtres],
    queryFn: () => getDoublons(filtres),
  });

export const useDoublons = (filtres: FiltresQualite = {}, enabled = true) =>
  useQuery({ ...getDoublonsQueryOptions(filtres), enabled });
