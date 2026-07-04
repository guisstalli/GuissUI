import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

/**
 * Annulation PUBLIQUE d'un rendez-vous via token (lien email/WhatsApp).
 * Endpoint sans auth : `DELETE /rendez-vous/annuler/{token}/` → 204.
 *
 * L'annulation n'est PAS déclenchée au chargement de la page (un prefetch de
 * lien annulerait le RDV à l'insu du patient) : la page affiche un bouton de
 * confirmation explicite qui appelle cette mutation.
 *
 * `silentErrors: true` : l'erreur est affichée sur la page, pas via le toast
 * global.
 */
export const cancelRdvPublic = (token: string): Promise<void> =>
  api.delete(`/rendez-vous/annuler/${token}/`, { silentErrors: true });

export const useCancelRdvPublic = ({
  onSuccess,
}: {
  onSuccess?: () => void;
} = {}) =>
  useMutation({
    mutationFn: (token: string) => cancelRdvPublic(token),
    onSuccess: () => {
      onSuccess?.();
    },
  });
