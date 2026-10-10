import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { EventCreateInput, EventStaff } from '../types/schemas';

/**
 * Modifier un événement planifié.
 *
 * Le service existait côté serveur, mais aucun écran ne l'appelait : une
 * erreur de date, de lieu ou de site ne se corrigeait qu'en supprimant
 * l'événement — avec ses inscrits.
 */
export const updateEvent = ({
  eventId,
  data,
}: {
  eventId: number;
  data: EventCreateInput;
}): Promise<EventStaff> =>
  api.put<EventStaff>(`/events/${eventId}/modifier/`, data);

export const useUpdateEvent = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onSuccess?.();
    },
  });
};
