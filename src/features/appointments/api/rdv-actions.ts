import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

const invalidateAll = (qc: ReturnType<typeof useQueryClient>) => {
  qc.invalidateQueries({ queryKey: ['rdv'] });
};

export const useConfirmRdv = (
  rdvId: number,
  { onSuccess }: { onSuccess?: () => void } = {},
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch(`/rendez-vous/${rdvId}/confirmer/`),
    onSuccess: () => {
      invalidateAll(qc);
      onSuccess?.();
    },
  });
};

export const useCancelRdvStaff = (
  rdvId: number,
  { onSuccess }: { onSuccess?: () => void } = {},
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch(`/rendez-vous/${rdvId}/annuler/`),
    onSuccess: () => {
      invalidateAll(qc);
      onSuccess?.();
    },
  });
};

export const useMarkPresent = (
  rdvId: number,
  { onSuccess }: { onSuccess?: () => void } = {},
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch(`/rendez-vous/${rdvId}/present/`),
    onSuccess: () => {
      invalidateAll(qc);
      onSuccess?.();
    },
  });
};

export const useMarkAbsent = (
  rdvId: number,
  { onSuccess }: { onSuccess?: () => void } = {},
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch(`/rendez-vous/${rdvId}/absent/`),
    onSuccess: () => {
      invalidateAll(qc);
      onSuccess?.();
    },
  });
};

export const useReplanifierRdvStaff = (
  rdvId: number,
  { onSuccess }: { onSuccess?: () => void } = {},
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { nouvelle_date: string; nouvelle_heure: string }) =>
      api.post(`/rendez-vous/${rdvId}/replanifier/`, data),
    onSuccess: () => {
      invalidateAll(qc);
      onSuccess?.();
    },
  });
};
