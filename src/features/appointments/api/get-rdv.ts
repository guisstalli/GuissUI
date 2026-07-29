import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { RendezVous } from '../types/schemas';

export const getRdv = (rdvId: number): Promise<RendezVous> =>
  api.get(`/rendez-vous/${rdvId}/`);

/**
 * Charge un rendez-vous par son identifiant.
 *
 * Sert au pré-remplissage de la page Facturation depuis l'agenda : seul l'id
 * voyage dans l'URL, et les données nominatives du patient (nom, prénom,
 * téléphone) sont récupérées ici, dans le corps de la réponse. Les faire
 * transiter en paramètres d'URL les exposerait dans l'historique du
 * navigateur, les journaux du proxy et le référent sortant.
 */
export const useRdv = (rdvId: number | null) =>
  useQuery({
    queryKey: ['rdv', 'detail', rdvId],
    queryFn: () => getRdv(rdvId as number),
    enabled: rdvId !== null,
    staleTime: 30_000,
  });
