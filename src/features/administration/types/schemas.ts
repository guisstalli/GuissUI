import { z } from 'zod';

// =============================================================================
// TABLEAU DE BORD ADMINISTRATEUR — GET /analytics/admin-dashboard/?days=
// =============================================================================

/** Ligne d'une répartition : le backend fournit le libellé, jamais la clé seule. */
export type LabelledCount = {
  key: string;
  label: string;
  count: number;
};

export type AdminDashboardUsers = {
  total: number;
  active: number;
  inactive: number;
  verified: number;
  unverified: number;
  new_last_30d: number;
  new_previous_30d: number;
  by_role: LabelledCount[];
};

/** Activité clinique — le pouls métier, distinct du trafic IA. */
export type AdminDashboardActivity = {
  examens_window: number;
  examens_previous_window: number;
  adultes_window: number;
  enfants_window: number;
  examens_per_day: { date: string; adultes: number; enfants: number }[];
};

/**
 * État d'avancement des examens.
 *
 * Adultes et enfants restent séparés : chez l'adulte la complétion est DÉRIVÉE
 * (technique + clinique remplis), chez l'enfant elle est DÉCLARÉE par une
 * action de finalisation. Un taux global mélangeant les deux ne voudrait rien
 * dire.
 */
export type AdminDashboardPipeline = {
  adultes: {
    total: number;
    complets: number;
    /** Technique faite, clinique en attente — du travail en souffrance. */
    attente_clinique: number;
    a_completer: number;
  };
  enfants: {
    total: number;
    finalises: number;
    en_cours: number;
  };
};

export type AdminDashboardAppointments = {
  passes: number;
  presents: number;
  absents: number;
  annules: number;
  /** null quand aucun rendez-vous passé n'a été pointé — pas 0 %. */
  taux_presence: number | null;
  a_venir: number;
};

export type AdminDashboardAiTraffic = {
  total_runs: number;
  success: number;
  failed: number;
  /** null quand aucune exécution — pas 0 %, qui suggérerait un échec total. */
  success_rate: number | null;
  runs_window: number;
  runs_previous_window: number;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
  cost_usd_window: number;
  by_capability: { key: string; count: number }[];
  runs_per_day: { date: string; runs: number }[];
};

export type AdminDashboardSecurity = {
  login_failed_7d: number;
  access_denied_7d: number;
  incidents_7d: number;
  incidents_previous_7d: number;
  events_30d: LabelledCount[];
};

export type AdminDashboardSystem = {
  patients: number;
  drivers: number;
  examens_adultes: number;
  examens_enfants: number;
  rapports_ia: number;
  rendez_vous: number;
};

export type AdminDashboard = {
  users: AdminDashboardUsers;
  activity: AdminDashboardActivity;
  pipeline: AdminDashboardPipeline;
  appointments: AdminDashboardAppointments;
  sites_activity: LabelledCount[];
  ai_traffic: AdminDashboardAiTraffic;
  security: AdminDashboardSecurity;
  system: AdminDashboardSystem;
  window_days: number;
  generated_at: string;
};

/** Fenêtres de temps proposées dans le sélecteur du tableau de bord. */
export const DASHBOARD_WINDOWS = [7, 14, 30] as const;
export type DashboardWindow = (typeof DASHBOARD_WINDOWS)[number];

// =============================================================================
// REGISTRE DES CAPACITÉS — GET /users/capabilities/
// =============================================================================

export type CapabilityRegistryItem = {
  code: string;
  label: string;
  category: string;
  description: string;
};

// =============================================================================
// JOURNAL DE SÉCURITÉ — GET /users/security-audit/
// =============================================================================

export type SecurityAuditEvent = {
  id: number;
  event: string;
  event_display: string;
  user_id: number | null;
  user_email: string | null;
  ip_address: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

// =============================================================================
// JOURNAL DES MODIFICATIONS — /logs/audit/
// =============================================================================

/**
 * Auteur d'un changement.
 *
 * `id` est nul pour les écritures hors requête HTTP (commande de gestion,
 * tâche planifiée, migration) : le backend renvoie alors le libellé
 * « Système ». `email` survit à la suppression du compte — c'est ce qui rend
 * le journal opposable après le départ d'un utilisateur.
 */
export type AuditActor = {
  id: number | null;
  email: string | null;
  label: string;
};

/**
 * Une entrée du journal des modifications.
 *
 * `changes` associe à chaque champ modifié le couple [ancienne, nouvelle].
 * Quand `changes_redacted` vaut `true`, le backend a remplacé les VALEURS par
 * des points — l'appelant n'a pas la capacité `patients.read` — mais les NOMS
 * DE CHAMPS restent exacts. Ne jamais présenter ces points comme la valeur
 * réellement enregistrée : voir `audit-trail-viewer`.
 */
export type AuditTrailEntry = {
  id: number;
  timestamp: string;
  /** Libellé déjà résolu par le backend : « create », « update », … */
  action: string;
  actor: AuditActor;
  ip_address: string | null;
  app_label: string;
  model: string;
  model_label: string;
  object_id: string;
  object_repr: string;
  changes: Record<string, [string, string]>;
  changes_redacted: boolean;
};

/** Entrée du référentiel alimentant le filtre « type d'objet ». */
export type AuditedModel = {
  app_label: string;
  model: string;
  label: string;
};

// =============================================================================
// GROUPES DE PERMISSIONS — /users/permission-groups/
// =============================================================================

export type PermissionGroup = {
  id: number;
  name: string;
  description: string;
  is_system: boolean;
  capabilities: string[];
  user_ids: number[];
  created_at: string;
};

// =============================================================================
// FORMULAIRE DE GROUPE (react-hook-form + zod)
// =============================================================================

export const PermissionGroupFormSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(150, 'Nom trop long'),
  description: z.string().max(500, 'Description trop longue').optional(),
});

export type PermissionGroupFormValues = z.infer<
  typeof PermissionGroupFormSchema
>;
