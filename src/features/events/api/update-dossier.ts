import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { EventDossier, EventStaff } from '../types/schemas';

/**
 * Renseigne le dossier de campagne d'un événement.
 *
 * Mise à jour PARTIELLE : le dossier se remplit à plusieurs mains et en
 * plusieurs fois — la méthodologie le jour même, l'équipe après coup. Un champ
 * absent de l'envoi n'est pas touché côté serveur.
 */
export const updateEventDossier = ({
  eventId,
  dossier,
}: {
  eventId: number;
  dossier: Partial<EventDossier>;
}): Promise<EventStaff> => api.patch(`/events/${eventId}/dossier/`, dossier);

export const useUpdateEventDossier = ({
  onSuccess,
  onError,
}: { onSuccess?: () => void; onError?: () => void } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateEventDossier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      onSuccess?.();
    },
    onError,
  });
};
