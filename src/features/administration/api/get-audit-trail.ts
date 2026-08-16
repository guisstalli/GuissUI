import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';
import type { DjangoPaginatedResponse } from '@/types/api';

import type { AuditedModel, AuditTrailEntry } from '../types/schemas';

/**
 * Journal des modifications — qui a modifié quel champ, quand, depuis quelle IP.
 *
 * À ne pas confondre avec `features/admin/api/get-audit-log.ts`, qui sert
 * l'historique d'UN utilisateur depuis `/users/{id}/audit-log/`. Celui-ci
 * couvre l'ensemble des modèles audités.
 */
export type AuditTrailParams = {
  limit?: number;
  offset?: number;
  actor_id?: number;
  /** 0=création, 1=modification, 2=suppression, 3=accès. */
  action?: number;
  app_label?: string;
  model?: string;
  object_id?: string;
  /** ISO 8601 — borne basse incluse. */
  date_from?: string;
  /** ISO 8601 — borne haute incluse. */
  date_to?: string;
  /** Recherche dans le libellé de l'objet (`object_repr`). */
  search?: string;
};

export const getAuditTrail = (
  params: AuditTrailParams = {},
): Promise<DjangoPaginatedResponse<AuditTrailEntry>> =>
  api.get('/logs/audit/', { params });

export const getAuditTrailQueryOptions = (params: AuditTrailParams = {}) =>
  queryOptions({
    queryKey: ['audit-trail', params],
    queryFn: () => getAuditTrail(params),
  });

export const useAuditTrail = (params: AuditTrailParams = {}) =>
  useQuery(getAuditTrailQueryOptions(params));

/**
 * Modèles réellement présents dans le journal, pour alimenter le filtre.
 *
 * Le backend ne renvoie que les modèles ayant au moins une entrée : un filtre
 * proposant un type d'objet qui ne donnera jamais aucun résultat est pire
 * qu'un filtre absent.
 */
export const getAuditedModels = (): Promise<AuditedModel[]> =>
  api.get('/logs/audit/audited-models/');

export const getAuditedModelsQueryOptions = () =>
  queryOptions({
    queryKey: ['audit-trail', 'audited-models'],
    queryFn: getAuditedModels,
    // Le référentiel ne bouge qu'à l'apparition d'un modèle jamais audité
    // jusque-là : inutile de le rafraîchir à chaque montage.
    staleTime: 5 * 60 * 1000,
  });

export const useAuditedModels = () => useQuery(getAuditedModelsQueryOptions());
