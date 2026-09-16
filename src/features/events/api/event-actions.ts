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

/**
 * Rétablit un événement annulé (retour au statut « planifié »).
 *
 * L'annulation était irréversible depuis l'interface : le 14/09/2026,
 * « Mairie Thiès Nord » annulé par erreur a dû être corrigé en base. Le serveur
 * prévient les inscrits que l'événement est maintenu, et réserve ce geste à
 * l'administration (capacité `config.manage`).
 */
export const useRestoreEvent = (
  eventId: number,
  { onSuccess, onError }: { onSuccess?: () => void; onError?: () => void } = {},
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.patch(`/events/${eventId}/retablir/`),
    onSuccess: () => {
      invalidateAll(qc);
      onSuccess?.();
    },
    onError,
  });
};

export type ReopenEventResult = { inscriptions_remises: number };

/**
 * Rouvre un événement terminé et remet ses absents « inscrits ».
 *
 * La clôture était irréversible depuis l'interface : le 16/09/2026,
 * « Mairie Thiès Nord », prévu le lendemain, a été clôturé et ses 29 inscrits
 * marqués absents. Réservé à l'administration (capacité `config.manage`).
 */
export const useReopenEvent = (
  eventId: number,
  {
    onSuccess,
    onError,
  }: {
    onSuccess?: (result: ReopenEventResult) => void;
    onError?: () => void;
  } = {},
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      api.patch<ReopenEventResult>(`/events/${eventId}/rouvrir/`),
    onSuccess: (result) => {
      invalidateAll(qc);
      onSuccess?.(result);
    },
    onError,
  });
};
