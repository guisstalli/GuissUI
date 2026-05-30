import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

interface CheckinInput {
  phone_number?: string;
  numero_inscription?: string;
}

export const useCheckin = (
  eventId: number,
  {
    onSuccess,
    onError,
  }: { onSuccess?: (data: unknown) => void; onError?: () => void } = {},
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CheckinInput) =>
      api.post(`/events/${eventId}/checkin/`, data),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['events', eventId, 'inscriptions'] });
      qc.invalidateQueries({ queryKey: ['events', eventId, 'stats'] });
      onSuccess?.(data);
    },
    onError,
  });
};
