import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Facture } from '../types/schemas';

const emettreFacture = (id: number): Promise<Facture> =>
  api.post(`/billing/factures/${id}/emettre/`);

export const useEmettreFacture = ({
  mutationConfig,
}: {
  mutationConfig?: { onSuccess?: (facture: Facture) => void };
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: emettreFacture,
    onSuccess: (facture) => {
      queryClient.invalidateQueries({ queryKey: ['factures'] });
      queryClient.invalidateQueries({ queryKey: ['factures', facture.id] });
      mutationConfig?.onSuccess?.(facture);
    },
  });
};
