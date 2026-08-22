import { queryOptions, useQuery } from '@tanstack/react-query';
import { isValidPhoneNumber } from 'react-phone-number-input';

import { api } from '@/lib/api-client';

import type { LookupTelephoneResponse } from '../types/types';

/**
 * Cherche un patient portant déjà ce numéro de téléphone.
 *
 * `phone_number` est UNIQUE en base : sans ce contrôle en amont, la création
 * d'un patient portant un numéro déjà pris échouait en 500 côté serveur.
 */
export const lookupTelephone = (
  phoneNumber: string,
): Promise<LookupTelephoneResponse> =>
  api.get<LookupTelephoneResponse>('/depistage/patients/lookup-telephone/', {
    params: { phone_number: phoneNumber },
    // Un numéro non trouvé n'est pas une anomalie : pas de toast global.
    silentErrors: true,
  });

/**
 * Délai de debounce de la saisie, en millisecondes.
 *
 * Le endpoint est limité à 120 requêtes/minute (2/s). Sans debounce, une saisie
 * rapide déclenche une requête par frappe et l'utilisateur se fait limiter au
 * milieu de son formulaire.
 */
export const LOOKUP_TELEPHONE_DEBOUNCE_MS = 500;

export const lookupTelephoneQueryOptions = (phoneNumber: string) =>
  queryOptions({
    queryKey: ['patients', 'lookup-telephone', phoneNumber],
    queryFn: () => lookupTelephone(phoneNumber),
    // Rien n'est envoyé tant que le numéro n'est pas complet et valide.
    enabled: !!phoneNumber && isValidPhoneNumber(phoneNumber),
    staleTime: 60_000,
    retry: false,
  });

type UseLookupTelephoneOptions = {
  /** Numéro au format E.164 (ex : `+221771234567`), déjà debouncé. */
  phoneNumber: string | null | undefined;
  enabled?: boolean;
};

/**
 * Hook de recherche d'un patient par téléphone.
 *
 * Passer une valeur DÉJÀ debouncée (voir `LOOKUP_TELEPHONE_DEBOUNCE_MS`) :
 * le hook ne debounce pas lui-même, il se contente de ne rien envoyer tant que
 * le numéro n'est pas un E.164 valide.
 */
export const useLookupTelephone = ({
  phoneNumber,
  enabled = true,
}: UseLookupTelephoneOptions) => {
  const options = lookupTelephoneQueryOptions(phoneNumber ?? '');
  return useQuery({
    ...options,
    enabled: enabled && options.enabled,
  });
};
