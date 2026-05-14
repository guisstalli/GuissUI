import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Facture, FactureCreate } from '../types/schemas';

const createFacture = (data: FactureCreate): Promise<Facture> =>
  api.post('/billing/factures/', data);

export const useCreateFacture = ({
  mutationConfig,
}: {
  mutationConfig?: { onSuccess?: (facture: Facture) => void };
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFacture,
    onSuccess: (facture) => {
      queryClient.invalidateQueries({ queryKey: ['factures'] });
      mutationConfig?.onSuccess?.(facture);
    },
  });
};
