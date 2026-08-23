import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';

type CorrigerSiteInput = {
  examenId: number;
  siteId: number;
  estAdulte: boolean;
};

/**
 * Corrige le site de dépistage d'un examen.
 *
 * Le site est omissible à la création : un examen pouvait naître sans lieu, et
 * rien ne permettait ensuite de le rattraper — la colonne « Site » restait
 * vide à vie et l'examen manquait dans tout agrégat par site, sans qu'aucun
 * écran ne signale l'anomalie.
 *
 * Le serveur l'autorise même sur un examen finalisé : l'oubli se découvre le
 * plus souvent après la clôture, et exiger une réouverture du dossier ferait
 * renoncer à la correction. Le site est administratif, pas clinique.
 */
const corrigerSite = ({ examenId, siteId, estAdulte }: CorrigerSiteInput) =>
  api.patch(
    `/depistage/examens/${estAdulte ? 'adultes' : 'enfants'}/${examenId}/site/`,
    { site_id: siteId },
  );

export const useCorrigerSiteExamen = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: corrigerSite,
    onSuccess: () => {
      // Les listes et la fiche affichent toutes la colonne « Site ».
      queryClient.invalidateQueries({ queryKey: ['exams'] });
      queryClient.invalidateQueries({ queryKey: ['patient-exams'] });
      addNotification({
        type: 'success',
        title: 'Site mis à jour',
        message: "Le site de dépistage de l'examen a été corrigé.",
      });
      onSuccess?.();
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Correction impossible',
        message: "Le site de l'examen n'a pas pu être modifié.",
      });
    },
  });
};
