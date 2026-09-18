import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';

import type { GroupeSitesDoublons, RattachementSites } from '../types/types';

/** Refus métier (site introuvable, liste vide) : le hook porte son message. */
const REFUS_METIER = { silentStatusCodes: [400, 404, 409] };

/**
 * Rattacher les patients à un lieu.
 *
 * Le site n'existait que sur l'examen : 3 441 patients n'en portaient aucun
 * (dump du 18/09/2026). Le rattrapage le déduit des examens quand ils
 * désignent tous le même — jamais autrement.
 */
export const rattacherSites = (
  appliquer: boolean,
): Promise<RattachementSites> =>
  api.post<RattachementSites>(
    '/analytics/qualite/sites/rattachement/',
    { appliquer },
    REFUS_METIER,
  );

export const useRattacherSites = ({
  onSuccess,
}: { onSuccess?: (resultat: RattachementSites) => void } = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: rattacherSites,
    onSuccess: (resultat) => {
      if (resultat.applique) {
        queryClient.invalidateQueries({ queryKey: ['qualite'] });
        queryClient.invalidateQueries({ queryKey: ['patients'] });
        addNotification({
          type: 'success',
          title: 'Patients rattachés',
          message:
            `${resultat.rattaches} patient(s) rattaché(s) à leur site. ` +
            `${resultat.ambigus} examiné(s) sur plusieurs sites, laissé(s) ` +
            'de côté.',
        });
      }
      onSuccess?.(resultat);
    },
    onError: (erreur: unknown) => {
      const { data } = (erreur ?? {}) as { data?: { detail?: string } };
      addNotification({
        type: 'error',
        title: 'Rattachement impossible',
        message: data?.detail ?? 'Rien n’a été modifié.',
      });
    },
  });
};

export const getSitesDoublons = (): Promise<GroupeSitesDoublons[]> =>
  api.get<GroupeSitesDoublons[]>('/analytics/qualite/sites/doublons/');

export const getSitesDoublonsQueryOptions = () =>
  queryOptions({
    queryKey: ['qualite', 'sites', 'doublons'],
    queryFn: getSitesDoublons,
  });

export const useSitesDoublons = () => useQuery(getSitesDoublonsQueryOptions());

export const fusionnerSites = (entree: {
  garde: number;
  doublons: number[];
}): Promise<Record<string, number | number[]>> =>
  api.post('/analytics/qualite/sites/fusion/', entree, REFUS_METIER);

export const useFusionnerSites = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: fusionnerSites,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qualite'] });
      queryClient.invalidateQueries({ queryKey: ['sites'] });
      addNotification({
        type: 'success',
        title: 'Sites réunis',
        message:
          'Examens et patients repointés sur le site conservé. Le double est ' +
          'désactivé, pas supprimé : son code figure dans des exports déjà ' +
          'transmis.',
      });
    },
    onError: (erreur: unknown) => {
      const { data } = (erreur ?? {}) as { data?: { detail?: string } };
      addNotification({
        type: 'error',
        title: 'Fusion impossible',
        message: data?.detail ?? 'Rien n’a été modifié.',
      });
    },
  });
};
