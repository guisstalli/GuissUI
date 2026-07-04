import { useMutation } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { RendezVous } from '../types/schemas';

/**
 * Confirmation PUBLIQUE d'une replanification via token (lien email, validité
 * courte). Endpoint sans auth : `POST /rendez-vous/replanifier/confirmer/{token}/`.
 * Retourne le rendez-vous replanifié (nouveau créneau) ou 400 si le lien est
 * invalide / expiré / déjà utilisé.
 *
 * POST (et non GET) car l'appel MUTE l'état (déplace le rendez-vous) : il ne
 * doit surtout pas être déclenché par le simple chargement de la page — les
 * scanners de liens et le préchargement des clients email suivent les GET, pas
 * les POST. La page affiche donc un bouton de confirmation explicite.
 *
 * `silentErrors: true` : l'erreur est affichée sur la page, pas via le toast
 * global.
 */
export const confirmReschedulePublic = (token: string): Promise<RendezVous> =>
  api.post(
    `/rendez-vous/replanifier/confirmer/${token}/`,
    {},
    {
      silentErrors: true,
    },
  );

export const useConfirmReschedulePublic = (token: string) =>
  useMutation({
    mutationFn: () => confirmReschedulePublic(token),
    retry: false,
  });
