import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { ChannelMessagesPage, MessagesParams } from '../types';

/**
 * Journal des messages, filtré et paginé.
 *
 * Le journal renvoyait une liste plate de 50 entrées, sans total ni filtre :
 * répondre à « qui ? » ou « par quel canal ? » supposait de tout faire défiler.
 * Les paramètres font partie de la clé de cache, donc changer un filtre ou de
 * page déclenche la bonne requête sans invalidation manuelle.
 */
export const getChannelMessagesQueryOptions = (params: MessagesParams = {}) =>
  queryOptions<ChannelMessagesPage>({
    queryKey: ['agent-channel-messages', params],
    queryFn: () =>
      // Le client HTTP attend un dictionnaire ouvert ; `MessagesParams` est un
      // type fermé, d'où l'élargissement explicite plutôt qu'un `any`.
      api.get('/agent-channels/messages/', {
        params: { ...params } as Record<string, string | number>,
      }),
    // Rafraîchissement automatique UNIQUEMENT sur la vue non filtrée
    // (`limit` et `offset` sont toujours présents, d'où le seuil à 2) :
    // pendant une investigation, voir la page se recharger sous les yeux fait
    // perdre la ligne que l'on était en train de lire.
    refetchInterval: Object.keys(params).length > 2 ? false : 15_000,
  });

export const useChannelMessages = (params: MessagesParams = {}) =>
  useQuery(getChannelMessagesQueryOptions(params));
