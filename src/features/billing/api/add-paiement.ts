import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Paiement, PaiementCreate } from '../types/schemas';

const addPaiement = ({
  factureId,
  data,
}: {
  factureId: number;
  data: PaiementCreate;
}): Promise<Paiement> =>
  api.post(`/billing/factures/${factureId}/paiements/`, data);

export const useAddPaiement = ({
  mutationConfig,
}: {
  mutationConfig?: { onSuccess?: (paiement: Paiement) => void };
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addPaiement,
    onSuccess: (paiement, variables) => {
      queryClient.invalidateQueries({ queryKey: ['factures'] });
      queryClient.invalidateQueries({
        queryKey: ['factures', variables.factureId],
      });
      mutationConfig?.onSuccess?.(paiement);
    },
  });
};
