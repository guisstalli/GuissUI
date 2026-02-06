import { z } from 'zod';

// =============================================================================
// ENUMS
// =============================================================================

/** Sexe du patient */
export const SexEnum = z.enum(['H', 'F', 'A']);

/** Labels pour le sexe */
export const SEX_LABELS: Record<z.infer<typeof SexEnum>, string> = {
  H: 'Homme',
  F: 'Femme',
  A: 'Anonyme',
};

/** Antécédents familiaux */
export const FamilialEnum = z.enum(['CECITE', 'GPAO', 'OTHER']);

export const FAMILIAL_LABELS: Record<z.infer<typeof FamilialEnum>, string> = {
  CECITE: 'Cécité',
  GPAO: 'GPAO',
  OTHER: 'Autre',
};

// =============================================================================
// PATIENT SCHEMAS
// =============================================================================

/**
 * Schéma pour la liste des patients (format léger)
 * Utilisé dans les réponses paginées
 */
export const PatientListSchema = z.object({
  id: z.number(),
  numero_identifiant: z.string(),
  last_name: z.string(),
  name: z.string(),
  full_name: z.string(),
  date_de_naissance: z.string(), // Format: YYYY-MM-DD
  age: z.number(),
  sex: SexEnum,
  is_adult: z.boolean(),
  phone_number: z.string().nullable().optional(),
  created: z.string().datetime(),
});

/**
 * Schéma complet pour un patient (détail)
 */
export const PatientSchema = z.object({
  id: z.number(),
  numero_identifiant: z.string(),
  last_name: z.string().max(100),
  name: z.string().max(100),
  full_name: z.string(),
  date_de_naissance: z.string(), // Format: YYYY-MM-DD
  age: z.number(),
  sex: SexEnum,
  is_adult: z.boolean(),
  phone_number: z.string().max(128).nullable().optional(),
  examens_count: z
    .object({
      adult: z.number().optional(),
      child: z.number().optional(),
    })
    .optional(),
  created: z.string().datetime(),
  modified: z.string().datetime(),
});

/**
 * Schéma pour créer un patient
 */
export const PatientCreateSchema = z.object({
  last_name: z.string().min(1, 'Le nom est requis').max(100),
  name: z.string().min(1, 'Le prénom est requis').max(100),
  date_de_naissance: z.string().min(1, 'La date de naissance est requise'),
  sex: SexEnum,
  phone_number: z.string().max(128).nullable().optional(),
});

/**
 * Schéma pour mettre à jour un patient (partiel)
 */
export const PatientUpdateSchema = PatientCreateSchema.partial();

// =============================================================================
// ANTECEDENT SCHEMAS
// =============================================================================

/**
 * Schéma pour les antécédents d'un patient
 */
export const AntecedentSchema = z.object({
  id: z.number(),
  patient: z.number(),
  antecedents_medico_chirurgicaux: z.array(z.string().max(255)).optional(),
  pathologie_ophtalmologique: z.array(z.string().max(255)).optional(),
  familial: z.array(FamilialEnum).optional(),
  autre_familial_detail: z.string().max(255).nullable().optional(),
  uses_screen: z.boolean().nullable().optional(),
  screen_time_hours_per_day: z.number().int().min(0).nullable().optional(),
  created: z.string().datetime(),
  modified: z.string().datetime(),
});

/**
 * Schéma pour créer/modifier des antécédents
 */
export const AntecedentCreateSchema = z.object({
  patient: z.number(),
  antecedents_medico_chirurgicaux: z.array(z.string().max(255)).optional(),
  pathologie_ophtalmologique: z.array(z.string().max(255)).optional(),
  familial: z.array(FamilialEnum).optional(),
  autre_familial_detail: z.string().max(255).nullable().optional(),
  uses_screen: z.boolean().nullable().optional(),
  screen_time_hours_per_day: z.number().int().min(0).nullable().optional(),
});

// =============================================================================
// PAGINATION SCHEMAS
// =============================================================================

/**
 * Réponse paginée pour la liste des patients (format Django)
 */
export const PaginatedPatientsResponseSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(PatientListSchema),
});

// =============================================================================
// BULK IMPORT SCHEMAS
// =============================================================================

/**
 * Schéma pour une ligne d'import patient
 */
export const PatientImportRowSchema = z.object({
  name: z.string().max(100),
  last_name: z.string().max(100),
  date_de_naissance: z.string(),
  sex: SexEnum,
  phone_number: z.string().max(20).optional(),
});

/**
 * Schéma pour l'import bulk de patients
 */
export const BulkPatientImportSchema = z.object({
  patients: z.array(PatientImportRowSchema).max(100),
});

/**
 * Réponse de création de tâche Celery
 */
export const TaskResponseSchema = z.object({
  task_id: z.string(),
  status: z.string(),
  message: z.string(),
});

/**
 * Statut d'une tâche Celery
 */
export const BulkImportResultSchema = z.object({
  status: z.enum(['completed', 'partial', 'failed']),
  success_count: z.number(),
  error_count: z.number(),
  errors: z.array(z.string()),
  created_ids: z.array(z.number()),
});

export const TaskStatusSchema = z.object({
  task_id: z.string(),
  status: z.string(),
  result: BulkImportResultSchema.nullable().optional(),
  error: z.string().nullable().optional(),
});
