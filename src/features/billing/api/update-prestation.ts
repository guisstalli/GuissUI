import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Prestation } from '../types/schemas';

type UpdatePrestationInput = {
  id: number;
  libelle?: string;
  prix?: string;
  description?: string;
  is_active?: boolean;
};

const updatePrestation = ({
  id,
  ...data
}: UpdatePrestationInput): Promise<Prestation> =>
  api.put(`/billing/prestations/${id}/update/`, data);

export const useUpdatePrestation = ({
  onSuccess,
  onError,
}: { onSuccess?: () => void; onError?: () => void } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updatePrestation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prestations'] });
      onSuccess?.();
    },
    onError,
  });
};
