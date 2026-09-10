import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';

import type { NettoyageRun, PlanNettoyage } from '../types/types';

/**
 * Simulation : n'écrit rien, annonce ce qui serait supprimé.
 *
 * C'est ce que l'écran affiche avant de demander confirmation. Confirmer une
 * suppression sans en connaître la portée n'est pas une confirmation.
 */
export const simulerNettoyage = (jour: string): Promise<PlanNettoyage> =>
  api.post<PlanNettoyage>('/analytics/qualite/nettoyage/simulation/', { jour });

export const useSimulerNettoyage = () => {
  const { addNotification } = useNotifications();
  return useMutation({
    mutationFn: simulerNettoyage,
    onError: (erreur: unknown) => {
      const { data } = (erreur ?? {}) as { data?: { detail?: string } };
      addNotification({
        type: 'error',
        title: 'Simulation impossible',
        message: data?.detail ?? 'La journée n’a pas pu être analysée.',
      });
    },
  });
};

export const appliquerNettoyage = (jour: string): Promise<NettoyageRun> =>
  api.post<NettoyageRun>('/analytics/qualite/nettoyage/', { jour });

export const useAppliquerNettoyage = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: appliquerNettoyage,
    onSuccess: (run) => {
      queryClient.invalidateQueries({ queryKey: ['qualite'] });
      addNotification({
        type: 'success',
        title: 'Nettoyage effectué',
        message:
          `${run.fusions} champ(s) fusionné(s), ${run.supprimes} examen(s) ` +
          `archivé(s), ${run.arbitrages_crees} valeur(s) à arbitrer. ` +
          'L’opération reste restaurable.',
      });
      onSuccess?.();
    },
    onError: (erreur: unknown) => {
      const { data } = (erreur ?? {}) as { data?: { detail?: string } };
      addNotification({
        type: 'error',
        title: 'Nettoyage impossible',
        message: data?.detail ?? 'Rien n’a été modifié.',
      });
    },
  });
};

export const getHistoriqueNettoyage = (): Promise<NettoyageRun[]> =>
  api.get<NettoyageRun[]>('/analytics/qualite/nettoyage/historique/');

export const getHistoriqueNettoyageQueryOptions = () =>
  queryOptions({
    queryKey: ['qualite', 'nettoyage', 'historique'],
    queryFn: getHistoriqueNettoyage,
  });

export const useHistoriqueNettoyage = () =>
  useQuery(getHistoriqueNettoyageQueryOptions());

export const restaurerNettoyage = (runId: number): Promise<NettoyageRun> =>
  api.post<NettoyageRun>(
    `/analytics/qualite/nettoyage/${runId}/restaurer/`,
    {},
  );

export const useRestaurerNettoyage = () => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: restaurerNettoyage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['qualite'] });
      addNotification({
        type: 'success',
        title: 'Nettoyage restauré',
        message: 'Les examens archivés ont été réinsérés.',
      });
    },
    onError: (erreur: unknown) => {
      const { data } = (erreur ?? {}) as { data?: { detail?: string } };
      addNotification({
        type: 'error',
        title: 'Restauration impossible',
        message: data?.detail ?? 'Rien n’a été modifié.',
      });
    },
  });
};
