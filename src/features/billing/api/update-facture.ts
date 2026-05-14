import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Facture, FactureUpdate } from '../types/schemas';

const updateFacture = ({
  id,
  data,
}: {
  id: number;
  data: FactureUpdate;
}): Promise<Facture> => api.patch(`/billing/factures/${id}/`, data);

export const useUpdateFacture = ({
  mutationConfig,
}: {
  mutationConfig?: { onSuccess?: (facture: Facture) => void };
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateFacture,
    onSuccess: (facture) => {
      queryClient.invalidateQueries({ queryKey: ['factures'] });
      queryClient.invalidateQueries({ queryKey: ['factures', facture.id] });
      mutationConfig?.onSuccess?.(facture);
    },
  });
};
