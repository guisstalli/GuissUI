import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { JourFerme } from '../types/schemas';

const createJourFerme = (data: {
  date: string;
  motif?: string;
}): Promise<JourFerme> => api.post('/rendez-vous/jours-fermes/create/', data);

const deleteJourFerme = (jourId: number): Promise<void> =>
  api.delete(`/rendez-vous/jours-fermes/${jourId}/`);

export const useCreateJourFerme = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createJourFerme,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jours-fermes'] });
      onSuccess?.();
    },
  });
};

export const useDeleteJourFerme = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteJourFerme,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['jours-fermes'] });
      onSuccess?.();
    },
  });
};
