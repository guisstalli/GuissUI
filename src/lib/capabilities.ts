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
  // Capacités métier — miroir de apps/users/capabilities.py. Les codes doivent
  // rester identiques des deux côtés : le serveur fait autorité, le client ne
  // fait qu'afficher ou masquer en conséquence.
  PATIENTS_READ: 'patients.read',
  PATIENTS_WRITE: 'patients.write',
  PATIENTS_DELETE: 'patients.delete',
  PATIENTS_EGRESS: 'patients.egress',
  EXAMS_READ: 'exams.read',
  EXAMS_TECHNICAL_WRITE: 'exams.technical.write',
  EXAMS_CLINICAL_WRITE: 'exams.clinical.write',
  EXAMS_CONCLUSION_WRITE: 'exams.conclusion.write',
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

/**
 * `enabled` permet aux appelants montés sur des pages PUBLIQUES de ne pas
 * déclencher un appel voué au 401. Sans argument, le comportement est
 * inchangé pour les appelants existants.
 */
export const useMyCapabilities = (options?: { enabled?: boolean }) =>
  useQuery({ ...getMyCapabilitiesQueryOptions(), ...options });

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
