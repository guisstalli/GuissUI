import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { BillingPreferences } from '../types/schemas';

type UpdateBillingPreferencesInput = Partial<
  Pick<
    BillingPreferences,
    'prefixe_facture' | 'conditions_paiement' | 'mention_legale'
  >
>;

const updateBillingPreferences = (
  data: UpdateBillingPreferencesInput,
): Promise<BillingPreferences> => api.put('/billing/preferences/', data);

export const useUpdateBillingPreferences = ({
  onSuccess,
  onError,
}: { onSuccess?: () => void; onError?: () => void } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateBillingPreferences,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['billing-preferences'] });
      onSuccess?.();
    },
    onError,
  });
};
