import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { RendezVous } from '../types/schemas';

/**
 * Confirmation PUBLIQUE d'une replanification via token (lien email, validité
 * courte). Endpoint sans auth : `GET /rendez-vous/replanifier/confirmer/{token}/`.
 * Retourne le rendez-vous replanifié (nouveau créneau) ou 400 si le lien est
 * invalide / expiré / déjà utilisé.
 *
 * `silentErrors: true` : l'erreur est affichée sur la page, pas via le toast
 * global.
 */
export const confirmReschedulePublic = (token: string): Promise<RendezVous> =>
  api.get(`/rendez-vous/replanifier/confirmer/${token}/`, {
    silentErrors: true,
  });

export const confirmReschedulePublicQueryKey = (token: string) =>
  ['rdv', 'reschedule-confirm', token] as const;

export const useConfirmReschedulePublic = (token: string) =>
  useQuery({
    queryKey: confirmReschedulePublicQueryKey(token),
    queryFn: () => confirmReschedulePublic(token),
    enabled: !!token,
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: Infinity,
    gcTime: 0,
  });
