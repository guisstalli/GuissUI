import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';

type CorrigerNaissanceInput = {
  patientId: number;
  dateDeNaissance: string;
  motif?: string;
};

type CorrectionResultat = {
  id: number;
  date_de_naissance: string;
  is_adult: boolean;
};

const invalider = (queryClient: ReturnType<typeof useQueryClient>) => {
  // La date de naissance décide de l'âge, du statut adulte et donc du
  // formulaire d'examen : toutes les listes qui l'affichent sont périmées.
  queryClient.invalidateQueries({ queryKey: ['patients'] });
  queryClient.invalidateQueries({ queryKey: ['patient'] });
  queryClient.invalidateQueries({ queryKey: ['drivers'] });
  queryClient.invalidateQueries({ queryKey: ['qualite'] });
};

/**
 * Répare une date de naissance.
 *
 * L'import du 26/06/2026 a repris six conducteurs dont la date de naissance
 * en fait des enfants de 0 à 7 ans — avec permis et examens adultes. Aucun
 * écran ne permettait de les corriger.
 *
 * Le serveur refuse une date future, ou une date qui rendrait mineur un
 * titulaire de permis : ces refus arrivent en 400/409 et méritent d'être
 * lus, pas remplacés par un « erreur » générique.
 */
export const useCorrigerDateNaissance = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: ({
      patientId,
      dateDeNaissance,
      motif,
    }: CorrigerNaissanceInput) =>
      api.post<CorrectionResultat>(
        `/depistage/patients/${patientId}/corriger-naissance/`,
        { date_de_naissance: dateDeNaissance, motif: motif ?? '' },
      ),
    onSuccess: (resultat) => {
      invalider(queryClient);
      addNotification({
        type: 'success',
        title: 'Date de naissance corrigée',
        message: resultat.is_adult
          ? 'Le patient est désormais rattaché au parcours adulte.'
          : 'Le patient est désormais rattaché au parcours enfant.',
      });
      onSuccess?.();
    },
    onError: (erreur: unknown) => {
      const detail =
        (erreur as { data?: { detail?: string } })?.data?.detail ??
        'La date de naissance n’a pas pu être corrigée.';
      addNotification({
        type: 'error',
        title: 'Correction refusée',
        message: detail,
      });
    },
  });
};

/**
 * Retire le statut conducteur en conservant le patient et ses examens.
 *
 * Le pendant manquant de la conversion patient → conducteur : sans lui, une
 * fiche conducteur créée par erreur ne pouvait que rester en place, ou être
 * supprimée avec son patient — donc avec ses examens.
 */
export const useRetirerStatutConducteur = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: ({ patientId, motif }: { patientId: number; motif?: string }) =>
      api.post<CorrectionResultat>(
        `/depistage/patients/${patientId}/retirer-statut-conducteur/`,
        { motif: motif ?? '' },
      ),
    onSuccess: () => {
      invalider(queryClient);
      addNotification({
        type: 'success',
        title: 'Statut conducteur retiré',
        message:
          'Le patient et ses examens sont conservés. Le dossier conducteur ' +
          'est archivé et peut être restauré.',
      });
      onSuccess?.();
    },
    onError: (erreur: unknown) => {
      const detail =
        (erreur as { data?: { detail?: string } })?.data?.detail ??
        'Le statut conducteur n’a pas pu être retiré.';
      addNotification({
        type: 'error',
        title: 'Retrait impossible',
        message: detail,
      });
    },
  });
};
