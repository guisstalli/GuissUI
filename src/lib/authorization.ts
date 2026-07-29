import { AuthUser } from './auth';

// =============================================================================
// ROLES — must match GuissAPI UserRoles enum exactly
// =============================================================================

export const ROLES = {
  ADMIN: 'ADMIN',
  STAFF: 'STAFF',
  DOCTEUR: 'DOCTEUR',
  TECHNICIEN: 'TECHNICIEN',
  DATA_ENTRY: 'DATA_ENTRY',
  SUPERUSER: 'SUPERUSER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Rôles autorisés pour l'application interne (tout sauf ADMIN) */
export const INTERNAL_APP_ROLES: Role[] = [
  ROLES.STAFF,
  ROLES.DOCTEUR,
  ROLES.TECHNICIEN,
  ROLES.DATA_ENTRY,
  ROLES.SUPERUSER,
];

// =============================================================================
// PERMISSIONS
// =============================================================================

export const PERMISSIONS = {
  // Patients
  'patients:view': 'Voir la liste des patients',
  'patients:create': 'Créer un patient',
  'patients:edit': 'Modifier un patient',
  'patients:delete': 'Supprimer un patient (soft-delete)',
  'patients:hard-delete': 'Supprimer définitivement un patient',
  'patients:restore': 'Restaurer un patient supprimé',
  'patients:view-deleted': 'Voir les patients supprimés',
  'patients:bulk-import': 'Importer des patients en masse',

  // Antécédents
  'antecedents:view': 'Voir les antécédents',
  'antecedents:edit': 'Modifier les antécédents',

  // Examens - Général
  'exams:view': 'Voir les examens',
  'exams:create': 'Créer un examen',
  'exams:delete': 'Supprimer un examen',

  // Examens - Données Techniques
  'exams:technical:view': 'Voir les données techniques',
  'exams:technical:edit': 'Modifier les données techniques',

  // Examens - Données Cliniques
  'exams:clinical:view': 'Voir les données cliniques',
  'exams:clinical:edit': 'Modifier les données cliniques',

  // Examens - Finalisation
  'exams:complete': 'Finaliser un examen',

  // Pièces jointes
  'attachments:view': 'Voir les pièces jointes',
  'attachments:upload': 'Uploader des pièces jointes',
  'attachments:delete': 'Supprimer des pièces jointes',

  // Consultations
  'consultations:view': 'Voir les consultations',
  'consultations:create': 'Créer une consultation',
  'consultations:edit': 'Modifier une consultation',
  'consultations:cancel': 'Annuler une consultation',

  // Rendez-vous
  'appointments:view': 'Voir les rendez-vous',
  'appointments:create': 'Créer un rendez-vous',
  'appointments:edit': 'Modifier un rendez-vous',
  'appointments:cancel': 'Annuler un rendez-vous',

  // Planning
  'planning:view': 'Voir le planning',

  // Analytics
  'analytics:view': 'Voir les analytics',

  // IA — assistant analytique + rapports (miroir de AI_REPORT_ROLES backend)
  'ai-reports:view': 'Voir les rapports IA',
  'ai-reports:generate': 'Poser une question IA et générer des rapports',
  'ai-reports:approve': 'Approuver ou rejeter un rapport IA',
  'ai-reports:deliver': 'Diffuser un rapport IA approuvé',

  // Reports
  'reports:view': 'Voir les rapports',
  'reports:export': 'Exporter les rapports',

  // Dossier Patient
  'patient-records:view': 'Voir les dossiers patients',

  // Partage de dossier (lien public à token — staff DOCTEUR/ADMIN côté API)
  'records:share': "Partager le dossier d'un examen (lien public)",

  // Sites
  'sites:view': 'Voir les sites',
  'sites:create': 'Créer un site',
  'sites:edit': 'Modifier un site',
  // L'endpoint DELETE ne supprime pas : il désactive. Le libellé le dit.
  'sites:delete': 'Désactiver un site',
  // Irréversible, et le backend la réserve à IsAnyAdmin (ADMIN/SUPERUSER).
  // ADMIN n'accédant pas à l'application interne, seul SUPERUSER la voit ici.
  'sites:hard-delete': 'Supprimer définitivement un site',

  // Conducteurs
  'drivers:view': 'Voir les conducteurs',
  'drivers:create': 'Créer un conducteur',
  'drivers:edit': 'Modifier un conducteur',
  'drivers:delete': 'Supprimer un conducteur (soft-delete)',
  'drivers:hard-delete': 'Supprimer définitivement un conducteur',
  'drivers:restore': 'Restaurer un conducteur supprimé',
  'drivers:view-deleted': 'Voir les conducteurs supprimés',
  'drivers:bulk-import': 'Importer des conducteurs en masse',

  // Facturation
  'billing:view': 'Voir la facturation',

  // Admin
  'admin:users': 'Gérer les utilisateurs',
  'admin:agent-channels':
    "Gérer les canaux de l'assistant IA (WhatsApp, email)",
} as const;

export type Permission = keyof typeof PERMISSIONS;

// =============================================================================
// ROLE → PERMISSIONS MAPPING
// =============================================================================

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  // ADMIN n'a pas accès à l'application interne — géré via interface admin dédiée
  ADMIN: ['admin:users', 'admin:agent-channels'],

  // SUPERUSER : toutes les permissions sans restriction (pour tests)
  SUPERUSER: [
    'patients:view',
    'patients:create',
    'patients:edit',
    'patients:delete',
    'patients:hard-delete',
    'patients:restore',
    'patients:view-deleted',
    'patients:bulk-import',
    'antecedents:view',
    'antecedents:edit',
    'exams:view',
    'exams:create',
    'exams:delete',
    'exams:technical:view',
    'exams:technical:edit',
    'exams:clinical:view',
    'exams:clinical:edit',
    'exams:complete',
    'attachments:view',
    'attachments:upload',
    'attachments:delete',
    'consultations:view',
    'consultations:create',
    'consultations:edit',
    'consultations:cancel',
    'appointments:view',
    'appointments:create',
    'appointments:edit',
    'appointments:cancel',
    'planning:view',
    'analytics:view',
    'reports:view',
    'reports:export',
    'patient-records:view',
    'records:share',
    'drivers:view',
    'billing:view',
    'sites:view',
    'sites:create',
    'sites:edit',
    'sites:delete',
    'sites:hard-delete',
    'admin:users',
    'admin:agent-channels',
    'drivers:create',
    'drivers:edit',
    'drivers:delete',
    'drivers:hard-delete',
    'drivers:restore',
    'drivers:view-deleted',
    'drivers:bulk-import',
    'ai-reports:view',
    'ai-reports:generate',
    'ai-reports:approve',
    'ai-reports:deliver',
  ],

  // STAFF : accès complet, gestion admin incluse
  // (analytics volontairement exclu — réservé à DOCTEUR / SUPERUSER)
  STAFF: [
    'patients:view',
    'patients:create',
    'patients:edit',
    'patients:delete',
    'patients:hard-delete',
    'patients:restore',
    'patients:view-deleted',
    'patients:bulk-import',
    'antecedents:view',
    'antecedents:edit',
    'exams:view',
    'exams:create',
    'exams:delete',
    'exams:technical:view',
    'exams:technical:edit',
    'exams:clinical:view',
    'exams:clinical:edit',
    'exams:complete',
    'attachments:view',
    'attachments:upload',
    'attachments:delete',
    'consultations:view',
    'consultations:create',
    'consultations:edit',
    'consultations:cancel',
    'appointments:view',
    'appointments:create',
    'appointments:edit',
    'appointments:cancel',
    'planning:view',
    'patient-records:view',
    'drivers:view',
    'billing:view',
    'sites:view',
    'sites:create',
    'sites:edit',
    'sites:delete',
    'admin:users',
    // IA : STAFF peut consulter/générer, mais pas approuver ni diffuser
    // (AI_REPORT_ROLES backend : approve/deliver = ADMIN/SUPERUSER/DOCTEUR)
    'ai-reports:view',
    'ai-reports:generate',
  ],

  // DOCTEUR : accès complet aux données médicales
  DOCTEUR: [
    'patients:view',
    'patients:create',
    'patients:edit',
    'patients:delete',
    'patients:restore',
    'patients:view-deleted',
    'patients:bulk-import',
    'antecedents:view',
    'antecedents:edit',
    'exams:view',
    'exams:create',
    'exams:delete',
    'exams:technical:view',
    'exams:technical:edit',
    'exams:clinical:view',
    'exams:clinical:edit',
    'exams:complete',
    'attachments:view',
    'attachments:upload',
    'attachments:delete',
    'consultations:view',
    'consultations:create',
    'consultations:edit',
    'consultations:cancel',
    'appointments:view',
    'appointments:create',
    'appointments:edit',
    'appointments:cancel',
    'planning:view',
    'analytics:view',
    'reports:view',
    'reports:export',
    'patient-records:view',
    'records:share',
    'drivers:view',
    'billing:view',
    'sites:view',
    'ai-reports:view',
    'ai-reports:generate',
    'ai-reports:approve',
    'ai-reports:deliver',
  ],

  // DATA_ENTRY : accès complet dépistage, pas d'analytics/billing/RDV/sites/admin
  // (analytics gaté — module non prêt pour ce rôle)
  DATA_ENTRY: [
    'patients:view',
    'patients:create',
    'patients:edit',
    'antecedents:view',
    'antecedents:edit',
    'exams:view',
    'exams:create',
    'exams:delete',
    'exams:technical:view',
    'exams:technical:edit',
    'exams:clinical:view',
    'exams:clinical:edit',
    'exams:complete',
    'attachments:view',
    'attachments:upload',
    'attachments:delete',
    'patient-records:view',
    'drivers:create',
    'drivers:edit',
    'drivers:delete',
    'drivers:hard-delete',
    'drivers:restore',
    'drivers:view-deleted',
    'drivers:bulk-import',
  ],

  // TECHNICIEN : données techniques uniquement
  TECHNICIEN: [
    'patients:view',
    'antecedents:view',
    'exams:view',
    'exams:technical:view',
    'exams:technical:edit',
    'exams:clinical:view',
    'consultations:view',
    'patient-records:view',
    'drivers:view',
  ],
};

// =============================================================================
// HELPER FUNCTIONS - ROLES
// =============================================================================

export const hasRole = (
  user: AuthUser | null | undefined,
  role: Role,
): boolean => {
  return user?.role === role;
};

export const hasAnyRole = (
  user: AuthUser | null | undefined,
  roles: Role[],
): boolean => {
  return roles.some((role) => user?.role === role);
};

// =============================================================================
// HELPER FUNCTIONS - PERMISSIONS
// =============================================================================

export const getUserPermissions = (
  user: AuthUser | null | undefined,
): Permission[] => {
  if (!user?.role) return [];

  const rolePermissions = ROLE_PERMISSIONS[user.role as Role];
  return rolePermissions ?? [];
};

export const hasPermission = (
  user: AuthUser | null | undefined,
  permission: Permission,
): boolean => {
  return getUserPermissions(user).includes(permission);
};

export const hasAnyPermission = (
  user: AuthUser | null | undefined,
  permissions: Permission[],
): boolean => {
  const userPermissions = getUserPermissions(user);
  return permissions.some((p) => userPermissions.includes(p));
};

export const hasAllPermissions = (
  user: AuthUser | null | undefined,
  permissions: Permission[],
): boolean => {
  const userPermissions = getUserPermissions(user);
  return permissions.every((p) => userPermissions.includes(p));
};

// =============================================================================
// ACCESS CHECKS
// =============================================================================

export const canAccessInternalApp = (
  user: AuthUser | null | undefined,
): boolean => {
  return hasAnyRole(user, INTERNAL_APP_ROLES);
};

export const isAdmin = (user: AuthUser | null | undefined): boolean =>
  hasRole(user, ROLES.ADMIN);

export const isStaff = (user: AuthUser | null | undefined): boolean =>
  hasRole(user, ROLES.STAFF);

export const isDocteur = (user: AuthUser | null | undefined): boolean =>
  hasRole(user, ROLES.DOCTEUR);

export const isTechnicien = (user: AuthUser | null | undefined): boolean =>
  hasRole(user, ROLES.TECHNICIEN);

export const isSuperuser = (user: AuthUser | null | undefined): boolean =>
  hasRole(user, ROLES.SUPERUSER);

export const isDataEntry = (user: AuthUser | null | undefined): boolean =>
  hasRole(user, ROLES.DATA_ENTRY);

// =============================================================================
// LABELS
// =============================================================================

export const getRoleLabel = (role: Role): string => {
  const labels: Record<Role, string> = {
    ADMIN: 'Administrateur',
    STAFF: 'Staff',
    DOCTEUR: 'Médecin',
    TECHNICIEN: 'Technicien',
    DATA_ENTRY: 'Saisie de données',
    SUPERUSER: 'Superutilisateur',
  };
  return labels[role] || role;
};

export const getPermissionLabel = (permission: Permission): string => {
  return PERMISSIONS[permission] || permission;
};
