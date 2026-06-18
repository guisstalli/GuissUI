import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type {
  RendezVousConfirmation,
  ReservationInput,
} from '../types/schemas';

// `silentErrors: true` : la réservation est un formulaire public ; l'erreur est
// affichée inline sous le formulaire, pas via le toast global de l'api-client.
export const bookAppointment = (
  data: ReservationInput,
): Promise<RendezVousConfirmation> =>
  api.post('/rendez-vous/reserver/', data, { silentErrors: true });

export const useBookAppointment = ({
  onSuccess,
}: {
  onSuccess?: (data: RendezVousConfirmation) => void;
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookAppointment,
    onSuccess: (data) => {
      // Une réservation publique rend stale les vues admin (liste + stats).
      queryClient.invalidateQueries({ queryKey: ['rdv'] });
      queryClient.invalidateQueries({ queryKey: ['rdv-stats'] });
      onSuccess?.(data);
    },
  });
};
