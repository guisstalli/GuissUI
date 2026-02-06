import { AuthUser } from './auth';

// =============================================================================
// ROLES
// =============================================================================

export const ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  TECHNICIAN: 'TECHNICIAN',
  DATA_ENTRY: 'DATA_ENTRY',
  PARTNER_USER: 'PARTNER_USER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Rôles autorisés pour l'application interne (tous sauf ADMIN) */
export const INTERNAL_APP_ROLES: Role[] = [
  ROLES.DOCTOR,
  ROLES.TECHNICIAN,
  ROLES.DATA_ENTRY,
  ROLES.PARTNER_USER,
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

  // Reports
  'reports:view': 'Voir les rapports',
  'reports:export': 'Exporter les rapports',

  // Dossier Patient
  'patient-records:view': 'Voir les dossiers patients',
} as const;

export type Permission = keyof typeof PERMISSIONS;

// =============================================================================
// ROLE → PERMISSIONS MAPPING
// =============================================================================

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  // ADMIN n'a pas accès à l'application interne
  ADMIN: [],

  // DOCTOR : accès complet aux données médicales
  DOCTOR: [
    // Patients
    'patients:view',
    'patients:create',
    'patients:edit',
    'patients:delete',
    'patients:restore',
    'patients:view-deleted',
    'patients:bulk-import',
    // Antécédents
    'antecedents:view',
    'antecedents:edit',
    // Examens
    'exams:view',
    'exams:create',
    'exams:delete',
    'exams:technical:view',
    'exams:technical:edit',
    'exams:clinical:view',
    'exams:clinical:edit',
    'exams:complete',
    // Pièces jointes
    'attachments:view',
    'attachments:upload',
    'attachments:delete',
    // Consultations
    'consultations:view',
    'consultations:create',
    'consultations:edit',
    'consultations:cancel',
    // Rendez-vous
    'appointments:view',
    'appointments:create',
    'appointments:edit',
    'appointments:cancel',
    // Planning
    'planning:view',
    // Analytics & Reports
    'analytics:view',
    'reports:view',
    'reports:export',
    // Dossier Patient
    'patient-records:view',
  ],

  // TECHNICIAN : données techniques uniquement
  TECHNICIAN: [
    // Patients (lecture + création)
    'patients:view',
    'patients:create',
    'patients:edit',
    // Antécédents (lecture)
    'antecedents:view',
    // Examens (techniques uniquement)
    'exams:view',
    'exams:create',
    'exams:technical:view',
    'exams:technical:edit',
    'exams:clinical:view', // Peut voir mais pas modifier
    // Pièces jointes
    'attachments:view',
    'attachments:upload',
    // Consultations (lecture)
    'consultations:view',
    // Rendez-vous
    'appointments:view',
    'appointments:create',
    'appointments:edit',
    // Planning
    'planning:view',
    // Dossier Patient
    'patient-records:view',
  ],

  // DATA_ENTRY : saisie de données
  DATA_ENTRY: [
    // Patients
    'patients:view',
    'patients:create',
    'patients:edit',
    'patients:bulk-import',
    // Antécédents
    'antecedents:view',
    'antecedents:edit',
    // Examens (création et technique)
    'exams:view',
    'exams:create',
    'exams:technical:view',
    'exams:technical:edit',
    // Pièces jointes
    'attachments:view',
    'attachments:upload',
    // Consultations
    'consultations:view',
    'consultations:create',
    // Rendez-vous
    'appointments:view',
    'appointments:create',
    'appointments:edit',
    // Planning
    'planning:view',
    // Dossier Patient
    'patient-records:view',
  ],

  // PARTNER_USER : accès limité en lecture
  PARTNER_USER: [
    // Patients (lecture uniquement)
    'patients:view',
    // Antécédents (lecture)
    'antecedents:view',
    // Examens (lecture uniquement)
    'exams:view',
    'exams:technical:view',
    'exams:clinical:view',
    // Pièces jointes (lecture)
    'attachments:view',
    // Consultations (lecture)
    'consultations:view',
    // Rendez-vous (lecture)
    'appointments:view',
    // Planning
    'planning:view',
    // Reports
    'reports:view',
    // Dossier Patient
    'patient-records:view',
  ],
};

// =============================================================================
// HELPER FUNCTIONS - ROLES
// =============================================================================

/**
 * Vérifie si l'utilisateur a un rôle spécifique
 */
export const hasRole = (
  user: AuthUser | null | undefined,
  role: Role,
): boolean => {
  return user?.roles?.includes(role) ?? false;
};

/**
 * Vérifie si l'utilisateur a au moins un des rôles spécifiés
 */
export const hasAnyRole = (
  user: AuthUser | null | undefined,
  roles: Role[],
): boolean => {
  return roles.some((role) => user?.roles?.includes(role)) ?? false;
};

/**
 * Vérifie si l'utilisateur a tous les rôles spécifiés
 */
export const hasAllRoles = (
  user: AuthUser | null | undefined,
  roles: Role[],
): boolean => {
  return roles.every((role) => user?.roles?.includes(role)) ?? false;
};

// =============================================================================
// HELPER FUNCTIONS - PERMISSIONS
// =============================================================================

/**
 * Récupère toutes les permissions d'un utilisateur basées sur ses rôles
 */
export const getUserPermissions = (
  user: AuthUser | null | undefined,
): Permission[] => {
  if (!user?.roles) return [];

  const permissions = new Set<Permission>();

  user.roles.forEach((role) => {
    const rolePermissions = ROLE_PERMISSIONS[role as Role];
    if (rolePermissions) {
      rolePermissions.forEach((permission) => permissions.add(permission));
    }
  });

  return Array.from(permissions);
};

/**
 * Vérifie si l'utilisateur a une permission spécifique
 */
export const hasPermission = (
  user: AuthUser | null | undefined,
  permission: Permission,
): boolean => {
  const userPermissions = getUserPermissions(user);
  return userPermissions.includes(permission);
};

/**
 * Vérifie si l'utilisateur a au moins une des permissions spécifiées
 */
export const hasAnyPermission = (
  user: AuthUser | null | undefined,
  permissions: Permission[],
): boolean => {
  const userPermissions = getUserPermissions(user);
  return permissions.some((permission) => userPermissions.includes(permission));
};

/**
 * Vérifie si l'utilisateur a toutes les permissions spécifiées
 */
export const hasAllPermissions = (
  user: AuthUser | null | undefined,
  permissions: Permission[],
): boolean => {
  const userPermissions = getUserPermissions(user);
  return permissions.every((permission) =>
    userPermissions.includes(permission),
  );
};

// =============================================================================
// ACCESS CHECKS
// =============================================================================

/**
 * Vérifie si l'utilisateur a accès à l'application interne
 */
export const canAccessInternalApp = (
  user: AuthUser | null | undefined,
): boolean => {
  return hasAnyRole(user, INTERNAL_APP_ROLES);
};

/**
 * Vérifie si l'utilisateur est un admin (pour le bloquer de l'app interne)
 */
export const isAdmin = (user: AuthUser | null | undefined): boolean => {
  return hasRole(user, ROLES.ADMIN);
};

/**
 * Vérifie si l'utilisateur est un médecin
 */
export const isDoctor = (user: AuthUser | null | undefined): boolean => {
  return hasRole(user, ROLES.DOCTOR);
};

/**
 * Vérifie si l'utilisateur est un technicien
 */
export const isTechnician = (user: AuthUser | null | undefined): boolean => {
  return hasRole(user, ROLES.TECHNICIAN);
};

/**
 * Vérifie si l'utilisateur est un opérateur de saisie
 */
export const isDataEntry = (user: AuthUser | null | undefined): boolean => {
  return hasRole(user, ROLES.DATA_ENTRY);
};

/**
 * Vérifie si l'utilisateur est un partenaire
 */
export const isPartnerUser = (user: AuthUser | null | undefined): boolean => {
  return hasRole(user, ROLES.PARTNER_USER);
};

// =============================================================================
// LABELS
// =============================================================================

/**
 * Récupère le label d'un rôle
 */
export const getRoleLabel = (role: Role): string => {
  const labels: Record<Role, string> = {
    ADMIN: 'Administrateur',
    DOCTOR: 'Médecin',
    TECHNICIAN: 'Technicien',
    DATA_ENTRY: 'Saisie de données',
    PARTNER_USER: 'Partenaire',
  };
  return labels[role] || role;
};

/**
 * Récupère la description d'une permission
 */
export const getPermissionLabel = (permission: Permission): string => {
  return PERMISSIONS[permission] || permission;
};
