import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { Prestation } from '../types/schemas';

type CreatePrestationInput = {
  libelle: string;
  prix: string;
  description?: string;
  is_active?: boolean;
};

const createPrestation = (data: CreatePrestationInput): Promise<Prestation> =>
  api.post('/billing/prestations/create/', data);

export const useCreatePrestation = ({
  onSuccess,
  onError,
}: { onSuccess?: () => void; onError?: () => void } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPrestation,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['prestations'] });
      onSuccess?.();
    },
    onError,
  });
};
