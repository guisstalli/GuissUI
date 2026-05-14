import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type {
  RendezVousConfirmation,
  ReservationInput,
} from '../types/schemas';

export const bookAppointment = (
  data: ReservationInput,
): Promise<RendezVousConfirmation> => api.post('/rendez-vous/reserver/', data);

export const useBookAppointment = ({
  onSuccess,
}: {
  onSuccess?: (data: RendezVousConfirmation) => void;
} = {}) =>
  useMutation({
    mutationFn: bookAppointment,
    onSuccess,
  });
