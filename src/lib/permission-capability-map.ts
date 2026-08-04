import type { Permission } from '@/lib/authorization';
import { CAPABILITY } from '@/lib/capabilities';

/**
 * Pont entre les deux systèmes de droits.
 *
 * `authorization.ts` porte ~50 permissions FIGÉES par rôle côté client.
 * `capabilities.ts` reflète les capacités effectives calculées par le serveur
 * (`défauts du rôle ∪ groupes de permission`).
 *
 * Sans ce pont, accorder une capacité à un utilisateur ne débloquait aucun
 * écran gaté par `hasPermission` : le client décidait seul, à partir du seul
 * rôle. Retirer l'assistant IA au médecin B n'aurait rien changé à ce qu'il
 * voyait.
 *
 * Toutes les permissions ne sont PAS mappées, et c'est délibéré : seules
 * celles qui ont une capacité correspondante côté serveur figurent ici. Les
 * autres continuent de passer par le rôle statique — mieux vaut un repli
 * explicite qu'une capacité inventée côté client, qui donnerait une illusion
 * de contrôle que le serveur ne respecterait pas.
 *
 * Module PUR (aucun hook) : `authorization.ts` est importé par
 * `middleware.ts`, qui tourne sur le runtime Edge.
 */
export const PERMISSION_TO_CAPABILITY: Partial<Record<Permission, string>> = {
  'patients:view': CAPABILITY.PATIENTS_READ,
  'patients:create': CAPABILITY.PATIENTS_WRITE,
  'patients:edit': CAPABILITY.PATIENTS_WRITE,
  'patients:delete': CAPABILITY.PATIENTS_DELETE,

  'exams:view': CAPABILITY.EXAMS_READ,
  'exams:technical:view': CAPABILITY.EXAMS_READ,
  'exams:clinical:view': CAPABILITY.EXAMS_READ,
  'exams:technical:edit': CAPABILITY.EXAMS_TECHNICAL_WRITE,
  'exams:clinical:edit': CAPABILITY.EXAMS_CLINICAL_WRITE,
};

/** Vrai si cette permission est arbitrée par le serveur. */
export const isCapabilityBacked = (permission: Permission): boolean =>
  permission in PERMISSION_TO_CAPABILITY;
