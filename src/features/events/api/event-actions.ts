import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

const invalidateAll = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: ['events'] });
};

export const useStartEvent = (
  eventId: number,
  { onSuccess, onError }: { onSuccess?: () => void; onError?: () => void } = {},
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch(`/events/${eventId}/demarrer/`),
    onSuccess: () => {
      invalidateAll(qc);
      onSuccess?.();
    },
    onError,
  });
};

export const useCloseEvent = (
  eventId: number,
  { onSuccess, onError }: { onSuccess?: () => void; onError?: () => void } = {},
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch(`/events/${eventId}/terminer/`),
    onSuccess: () => {
      invalidateAll(qc);
      onSuccess?.();
    },
    onError,
  });
};

export const useCancelEvent = (
  eventId: number,
  { onSuccess, onError }: { onSuccess?: () => void; onError?: () => void } = {},
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { raison?: string }) =>
      api.patch(`/events/${eventId}/annuler/`, data),
    onSuccess: () => {
      invalidateAll(qc);
      onSuccess?.();
    },
    onError,
  });
};

export const useDeleteEvent = (
  eventId: number,
  { onSuccess, onError }: { onSuccess?: () => void; onError?: () => void } = {},
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.delete(`/events/${eventId}/supprimer/`),
    onSuccess: () => {
      invalidateAll(qc);
      onSuccess?.();
    },
    onError,
  });
};
