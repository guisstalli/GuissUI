import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

/**
 * Ce que le serveur a réellement fait de l'inscription.
 *
 * `phone_number` est UNIQUE en base : quand le numéro désigne déjà un patient,
 * le serveur RATTACHE l'inscription à ce dossier au lieu d'en créer un second
 * — ce qui échouait en 500. L'écran doit donc annoncer l'un ou l'autre.
 */
export interface ConvertResult {
  action: 'rattache' | 'cree';
  patient_id: number;
}

export const useConvertToPatient = (
  eventId: number,
  {
    onSuccess,
    onError,
  }: { onSuccess?: (data: ConvertResult) => void; onError?: () => void } = {},
) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inscriptionId: number) =>
      api.post<ConvertResult>(
        `/events/${eventId}/inscriptions/${inscriptionId}/convert/`,
        {},
      ),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['events', eventId, 'inscriptions'] });
      onSuccess?.(data);
    },
    onError,
  });
};
