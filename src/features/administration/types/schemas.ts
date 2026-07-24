import { z } from 'zod';

// =============================================================================
// TABLEAU DE BORD ADMINISTRATEUR — GET /analytics/admin-dashboard/?days=
// =============================================================================

export type AdminDashboardUsers = {
  total: number;
  active: number;
  inactive: number;
  verified: number;
  unverified: number;
  new_last_30d: number;
  by_role: Record<string, number>;
};

export type AdminDashboardAiTraffic = {
  total_runs: number;
  success: number;
  failed: number;
  tokens_in: number;
  tokens_out: number;
  cost_usd: number;
  by_capability: Record<string, number>;
  runs_per_day: { date: string; runs: number }[];
};

export type AdminDashboardSecurity = {
  login_failed_7d: number;
  access_denied_7d: number;
  by_event_30d: Record<string, number>;
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
