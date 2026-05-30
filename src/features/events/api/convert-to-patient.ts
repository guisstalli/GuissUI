import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

export const useConvertToPatient = (
  eventId: number,
  {
    onSuccess,
    onError,
  }: { onSuccess?: (data: unknown) => void; onError?: () => void } = {},
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inscriptionId: number) =>
      api.post(`/events/${eventId}/inscriptions/${inscriptionId}/convert/`, {}),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['events', eventId, 'inscriptions'] });
      onSuccess?.(data);
    },
    onError,
  });
};
