import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

// =============================================================================
// CAPABILITÉS EFFECTIVES DE L'UTILISATEUR COURANT (côté serveur)
// -----------------------------------------------------------------------------
// Miroir client de authorization.ts, mais piloté par le backend : les capacités
// proviennent des groupes de permissions gérés en base (GET /users/me/capabilities/).
// Placé dans src/lib (et non dans une feature) parce que la sidebar — composant
// partagé — doit pouvoir l'importer (la règle ESLint import/no-restricted-paths
// interdit à src/components d'importer src/features).
// =============================================================================

/** Codes de capacités connus utilisés pour le gating des pages/menus. */
export const CAPABILITY = {
  AI_CHAT_ACCESS: 'ai.chat.access',
  ANALYTICS_ADMIN: 'analytics.admin',
  SECURITY_AUDIT_VIEW: 'security.audit.view',
  PERMISSIONS_MANAGE: 'permissions.manage',
  USERS_MANAGE: 'users.manage',
  AI_REPORTS_VIEW: 'ai.reports.view',
} as const;

export type CapabilityCode = string;

export type MyCapabilities = {
  capabilities: CapabilityCode[];
  is_superuser: boolean;
};

export const getMyCapabilities = (): Promise<MyCapabilities> =>
  api.get('/users/me/capabilities/');

export const getMyCapabilitiesQueryOptions = () =>
  queryOptions({
    queryKey: ['my-capabilities'],
    queryFn: getMyCapabilities,
    // Change rarement pendant une session — cache agressif pour éviter un
    // aller-retour sur chaque rendu de la sidebar.
    staleTime: 5 * 60 * 1000,
  });

export const useMyCapabilities = () =>
  useQuery(getMyCapabilitiesQueryOptions());

/**
 * Vérifie si un jeu de capacités couvre `code`.
 * Un superutilisateur possède implicitement toutes les capacités.
 */
export const hasCapability = (
  data: MyCapabilities | undefined,
  code: CapabilityCode,
): boolean => {
  if (!data) return false;
  return data.is_superuser || data.capabilities.includes(code);
};

/** Hook pratique : true dès que l'utilisateur courant possède `code`. */
export const useHasCapability = (code: CapabilityCode): boolean => {
  const { data } = useMyCapabilities();
  return hasCapability(data, code);
};
