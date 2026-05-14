import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { JourFerme } from '../types/schemas';

const getJoursFermes = (): Promise<JourFerme[]> =>
  api.get('/rendez-vous/jours-fermes/');

export const getJoursFermesQueryOptions = () =>
  queryOptions({ queryKey: ['jours-fermes'], queryFn: getJoursFermes });

export const useJoursFermes = () => useQuery(getJoursFermesQueryOptions());
