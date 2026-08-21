import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Proposal } from '../types';

export const applyProposal = (id: number): Promise<Proposal> =>
  api.post(
    `/ai-reports/insights/proposals/${id}/apply/`,
    {},
    /** Le 409 est un résultat métier (cible modifiée, doublon, plafond).
     *  On veut le message serveur, pas un toast "Erreur" générique.
     *  On capture donc l'erreur dans le onError du hook pour l'afficher. */
    { silentStatusCodes: [409] },
  );

export const useApplyProposal = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (proposal: Proposal) => void;
  onError?: (error: Error) => void;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: applyProposal,
    onSuccess: (proposal) => {
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] });
      onSuccess?.(proposal);
    },
    onError,
  });
};
