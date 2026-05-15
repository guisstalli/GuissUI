import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Facture } from '../types/schemas';

const annulerFacture = (id: number): Promise<Facture> =>
  api.post(`/billing/factures/${id}/annuler/`);

export const useAnnulerFacture = ({
  mutationConfig,
}: {
  mutationConfig?: { onSuccess?: (facture: Facture) => void };
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: annulerFacture,
    onSuccess: (facture) => {
      queryClient.invalidateQueries({ queryKey: ['factures'] });
      queryClient.invalidateQueries({ queryKey: ['factures', facture.id] });
      mutationConfig?.onSuccess?.(facture);
    },
  });
};
