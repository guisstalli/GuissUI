import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { ChannelStats } from '../types';

/**
 * Indicateurs d'en-tête des canaux.
 *
 * Existe pour qu'un incident se voie SANS lire le journal. C'est
 * `failed_messages_24h` qui aurait signalé l'erreur 63112 (compte WhatsApp
 * désactivé par Meta) : les messages s'affichaient « envoyés » et rien
 * n'attirait l'attention.
 */
export const getChannelStatsQueryOptions = () =>
  queryOptions<ChannelStats>({
    queryKey: ['agent-channel-stats'],
    queryFn: () => api.get('/agent-channels/stats/'),
    // Une minute suffit : ce sont des compteurs de supervision, pas un flux.
    refetchInterval: 60_000,
  });

export const useChannelStats = () => useQuery(getChannelStatsQueryOptions());
