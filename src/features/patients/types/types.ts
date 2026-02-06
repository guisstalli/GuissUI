import { z } from 'zod';

import {
  PatientSchema,
  PatientListSchema,
  PatientCreateSchema,
  PatientUpdateSchema,
  AntecedentSchema,
  AntecedentCreateSchema,
  PaginatedPatientsResponseSchema,
  PatientImportRowSchema,
  BulkPatientImportSchema,
  TaskResponseSchema,
  TaskStatusSchema,
  BulkImportResultSchema,
  SexEnum,
  FamilialEnum,
} from './schemas';

// =============================================================================
// INFERRED TYPES
// =============================================================================

/** Type pour le sexe */
export type Sex = z.infer<typeof SexEnum>;

/** Type pour les antécédents familiaux */
export type Familial = z.infer<typeof FamilialEnum>;

/** Patient complet (détail) */
export type Patient = z.infer<typeof PatientSchema>;

/** Patient pour les listes (format léger) */
export type PatientList = z.infer<typeof PatientListSchema>;

/** Données pour créer un patient */
export type PatientCreate = z.infer<typeof PatientCreateSchema>;

/** Données pour mettre à jour un patient */
export type PatientUpdate = z.infer<typeof PatientUpdateSchema>;

/** Antécédents d'un patient */
export type Antecedent = z.infer<typeof AntecedentSchema>;

/** Données pour créer/modifier des antécédents */
export type AntecedentCreate = z.infer<typeof AntecedentCreateSchema>;

/** Réponse paginée pour la liste des patients */
export type PaginatedPatientsResponse = z.infer<
  typeof PaginatedPatientsResponseSchema
>;

/** Ligne d'import patient */
export type PatientImportRow = z.infer<typeof PatientImportRowSchema>;

/** Données pour l'import bulk */
export type BulkPatientImport = z.infer<typeof BulkPatientImportSchema>;

/** Réponse de création de tâche */
export type TaskResponse = z.infer<typeof TaskResponseSchema>;

/** Statut d'une tâche */
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

/** Résultat d'import bulk */
export type BulkImportResult = z.infer<typeof BulkImportResultSchema>;

// =============================================================================
// QUERY PARAMS TYPES
// =============================================================================

/** Paramètres de requête pour la liste des patients */
export type PatientsQueryParams = {
  limit?: number;
  offset?: number;
  ordering?: string;
  search?: string;
  is_adult?: boolean;
  sex?: Sex;
  created_after?: string;
};
