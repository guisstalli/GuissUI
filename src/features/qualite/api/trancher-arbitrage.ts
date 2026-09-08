import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';

import type { Arbitrage, DecisionArbitrage } from '../types/types';

type TrancherInput = {
  arbitrageId: number;
  decision: DecisionArbitrage;
  commentaire?: string;
};

const LIBELLE_DECISION: Record<DecisionArbitrage, string> = {
  conservee: 'Valeur actuelle conservée',
  remplacee: 'Valeur écartée retenue',
  ignoree: 'Conflit écarté',
};

const trancher = ({ arbitrageId, decision, commentaire }: TrancherInput) =>
  api.post<Arbitrage>(`/analytics/arbitrages/${arbitrageId}/decision/`, {
    decision,
    commentaire: commentaire ?? '',
  });

/**
 * Enregistre le choix du médecin sur une valeur concurrente.
 *
 * Seule `remplacee` écrit dans le dossier ; les deux autres se contentent
 * d'acter. C'est déjà l'essentiel : un conflit tranché quitte la file et cesse
 * de solliciter l'attention, ce qui est précisément ce qui a manqué en août —
 * 24 valeurs dormaient dans un fichier JSON que personne n'ouvrait.
 */
export const useTrancherArbitrage = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: trancher,
    onSuccess: (_donnees, variables) => {
      queryClient.invalidateQueries({ queryKey: ['qualite', 'arbitrages'] });
      addNotification({
        type: 'success',
        title: 'Décision enregistrée',
        message: LIBELLE_DECISION[variables.decision],
      });
      onSuccess?.();
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Décision non enregistrée',
        message:
          "La valeur n'a pas pu être tranchée. Elle reste en attente : rien " +
          "n'a été écrit dans le dossier.",
      });
    },
  });
};
