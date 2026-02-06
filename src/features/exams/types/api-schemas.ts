import { z } from 'zod';

// =============================================================================
// API RESPONSE SCHEMAS - Correspond exactement aux réponses du backend
// Ces schémas représentent les données telles qu'elles sont retournées par l'API
// =============================================================================

/** Patient nested schema */
export const PatientNestedApiSchema = z.object({
  id: z.number(),
  numero_identifiant: z.string(),
  last_name: z.string(),
  name: z.string(),
  full_name: z.string(),
  date_de_naissance: z.string(),
  age: z.number(),
  sex: z.enum(['H', 'F', 'A']),
  is_adult: z.boolean(),
  phone_number: z.string().nullable().optional(),
  created: z.string(),
});

// =============================================================================
// TECHNICAL EXAM API SCHEMAS
// =============================================================================

/** Visual Acuity API Response - Les valeurs sont des strings */
export const VisualAcuityApiSchema = z.object({
  id: z.number().optional(),
  avsc_od: z.string().nullable().optional(),
  avsc_og: z.string().nullable().optional(),
  avsc_odg: z.string().nullable().optional(),
  avac_od: z.string().nullable().optional(),
  avac_og: z.string().nullable().optional(),
  avac_odg: z.string().nullable().optional(),
  created: z.string().optional(),
  modified: z.string().optional(),
});

/** Refraction API Response - utilise od_s, od_c, od_a au lieu de od_sphere, etc. */
export const RefractionApiSchema = z.object({
  id: z.number().optional(),
  // OD
  od_s: z.string().nullable().optional(),
  od_c: z.string().nullable().optional(),
  od_a: z.string().nullable().optional(),
  // OG
  og_s: z.string().nullable().optional(),
  og_c: z.string().nullable().optional(),
  og_a: z.string().nullable().optional(),
  // Retinoscopy
  retinoscopie_focale_h: z.string().nullable().optional(),
  retinoscopie_focale_v: z.string().nullable().optional(),
  retinoscopie_axe_h: z.string().nullable().optional(),
  retinoscopie_avec_focale_h: z.string().nullable().optional(),
  retinoscopie_avec_focale_v: z.string().nullable().optional(),
  retinoscopie_avec_axe_h: z.string().nullable().optional(),
  // Visual acuity after correction
  avod: z.string().nullable().optional(),
  avog: z.string().nullable().optional(),
  avodg: z.string().nullable().optional(),
  // Pupillary distance
  dp: z.string().nullable().optional(),
  created: z.string().optional(),
  modified: z.string().optional(),
});

/** Ocular Tension API Response */
export const OcularTensionApiSchema = z.object({
  id: z.number().optional(),
  od: z.string().nullable().optional(),
  og: z.string().nullable().optional(),
  created: z.string().optional(),
  modified: z.string().optional(),
});

/** Pachymetry API Response */
export const PachymetryApiSchema = z.object({
  id: z.number().optional(),
  od: z.string().nullable().optional(),
  og: z.string().nullable().optional(),
  cto_od: z.number().nullable().optional(),
  cto_og: z.number().nullable().optional(),
  created: z.string().optional(),
  modified: z.string().optional(),
});

/** Technical Examen API Response */
export const TechnicalExamenApiSchema = z.object({
  id: z.number(),
  visual_acuity: VisualAcuityApiSchema.nullable().optional(),
  refraction: RefractionApiSchema.nullable().optional(),
  ocular_tension: OcularTensionApiSchema.nullable().optional(),
  pachymetry: PachymetryApiSchema.nullable().optional(),
  is_completed: z.boolean(),
  completion_status: z.record(z.unknown()).optional(),
  created: z.string(),
  modified: z.string(),
});

// =============================================================================
// CLINICAL EXAM API SCHEMAS
// =============================================================================

/** Plaintes API Response */
export const PlaintesApiSchema = z.object({
  id: z.number().optional(),
  eye_symptom: z.array(z.string()),
  autre: z.string().nullable().optional(),
  diplopie: z.boolean(),
  diplopie_type: z.string().nullable().optional(),
  strabisme: z.boolean(),
  strabisme_eye: z.string().nullable().optional(),
  nystagmus: z.boolean(),
  nystagmus_eye: z.string().nullable().optional(),
  ptosis: z.boolean(),
  ptosis_eye: z.string().nullable().optional(),
  created: z.string().optional(),
  modified: z.string().optional(),
});

/** Biomicroscopy Anterior API Response */
export const BiomicroscopyAnteriorApiSchema = z.object({
  id: z.number().optional(),
  segment: z.string(),
  cornee: z.string().nullable().optional(),
  cornee_autre: z.string().nullable().optional(),
  profondeur: z.string().nullable().optional(),
  transparence: z.string().nullable().optional(),
  type_anomalie_value: z.string().nullable().optional(),
  type_anomalie_autre: z.string().nullable().optional(),
  quantite_anomalie: z.string().nullable().optional(),
  pupille: z.string().nullable().optional(),
  axe_visuel: z.string().nullable().optional(),
  rpm: z.string().nullable().optional(),
  iris: z.string().nullable().optional(),
  iris_autres: z.string().nullable().optional(),
  cristallin: z.string().nullable().optional(),
  position_cristallin: z.string().nullable().optional(),
  created: z.string().optional(),
  modified: z.string().optional(),
});

/** Biomicroscopy Posterior API Response */
export const BiomicroscopyPosteriorApiSchema = z.object({
  id: z.number().optional(),
  segment: z.string(),
  vitre: z.string().nullable().optional(),
  vitre_autres: z.string().nullable().optional(),
  papille: z.string().nullable().optional(),
  papille_autres: z.string().nullable().optional(),
  macula: z.string().nullable().optional(),
  retinien_peripherique: z.string().nullable().optional(),
  retinien_peripherique_autre: z.string().nullable().optional(),
  vaissaux: z.string().nullable().optional(),
  cd: z.string().nullable().optional(),
  observation: z.string().nullable().optional(),
  created: z.string().optional(),
  modified: z.string().optional(),
});

/** Eye Exam API Response (OD ou OG) */
export const EyeExamApiSchema = z.object({
  id: z.number().optional(),
  bp_sg_anterieur: BiomicroscopyAnteriorApiSchema,
  bp_sg_posterieur: BiomicroscopyPosteriorApiSchema,
  created: z.string().optional(),
  modified: z.string().optional(),
});

/** Perimetry API Response */
export const PerimetryApiSchema = z.object({
  id: z.number().optional(),
  pbo: z.array(z.string()),
  limite_superieure: z.string().nullable().optional(),
  limite_inferieure: z.string().nullable().optional(),
  etendue_horizontal: z.string().nullable().optional(),
  limite_temporale_droit: z.string().nullable().optional(),
  limite_temporale_gauche: z.string().nullable().optional(),
  score_esternmen: z.string().nullable().optional(),
  created: z.string().optional(),
  modified: z.string().optional(),
});

/** Conclusion API Response */
export const ConclusionApiSchema = z.object({
  id: z.number().optional(),
  vision: z.string().nullable().optional(),
  cat: z.string().nullable().optional(),
  traitement: z.string().nullable().optional(),
  observation: z.string().nullable().optional(),
  diagnostic_cim_11: z.array(z.string()).nullable().optional(),
  created: z.string().optional(),
  modified: z.string().optional(),
});

/** Clinical Examen API Response */
export const ClinicalExamenApiSchema = z.object({
  id: z.number(),
  plaintes: PlaintesApiSchema.nullable().optional(),
  od: EyeExamApiSchema.nullable().optional(),
  og: EyeExamApiSchema.nullable().optional(),
  perimetry: PerimetryApiSchema.nullable().optional(),
  conclusion: ConclusionApiSchema.nullable().optional(),
  is_completed: z.boolean(),
  completion_status: z.record(z.unknown()).optional(),
  created: z.string(),
  modified: z.string(),
});

// =============================================================================
// EXAMEN ADULTE API SCHEMAS
// =============================================================================

/** Examen adulte détail API Response */
export const ExamenAdultDetailApiSchema = z.object({
  id: z.number(),
  numero_examen: z.string(),
  patient: PatientNestedApiSchema,
  technical_examen: TechnicalExamenApiSchema.nullable().optional(),
  clinical_examen: ClinicalExamenApiSchema.nullable().optional(),
  is_completed: z.boolean(),
  completion_status: z.record(z.unknown()).optional(),
  created: z.string(),
  modified: z.string(),
});

// =============================================================================
// EXAMEN ENFANT API SCHEMAS
// =============================================================================

/** Vision Binoculaire API Response (Child) */
export const VisionBinoculaireApiSchema = z.object({
  id: z.number().optional(),
  hirschberg_type: z.string().nullable().optional(),
  hirschberg_detail: z.string().nullable().optional(),
  stereoscopie_lang_ii: z.string().nullable().optional(),
  reflet_pupillaire: z.string().nullable().optional(),
  reflet_pupillaire_detail: z.string().nullable().optional(),
  reflet_lateralite: z.string().nullable().optional(),
  cover_vl_type: z.string().nullable().optional(),
  cover_vl_direction: z.string().nullable().optional(),
  cover_vp_type: z.string().nullable().optional(),
  cover_vp_direction: z.string().nullable().optional(),
  created: z.string().optional(),
  modified: z.string().optional(),
});

/** Examen enfant détail API Response */
export const ExamenChildDetailApiSchema = z.object({
  id: z.number(),
  numero_examen: z.string(),
  patient: PatientNestedApiSchema,
  reflet_pupillaire: z.string().nullable().optional(),
  reflet_pupillaire_detail: z.string().nullable().optional(),
  fo: z.string().nullable().optional(),
  fo_detail: z.string().nullable().optional(),
  visual_acuity: VisualAcuityApiSchema.nullable().optional(),
  ocular_tension: OcularTensionApiSchema.nullable().optional(),
  refraction: RefractionApiSchema.nullable().optional(),
  vision_binoculaire: VisionBinoculaireApiSchema.nullable().optional(),
  created: z.string(),
  modified: z.string(),
});

// =============================================================================
// TYPE EXPORTS - API Response Types
// =============================================================================

export type PatientNestedApi = z.infer<typeof PatientNestedApiSchema>;
export type VisualAcuityApi = z.infer<typeof VisualAcuityApiSchema>;
export type RefractionApi = z.infer<typeof RefractionApiSchema>;
export type OcularTensionApi = z.infer<typeof OcularTensionApiSchema>;
export type PachymetryApi = z.infer<typeof PachymetryApiSchema>;
export type TechnicalExamenApi = z.infer<typeof TechnicalExamenApiSchema>;
export type PlaintesApi = z.infer<typeof PlaintesApiSchema>;
export type BiomicroscopyAnteriorApi = z.infer<
  typeof BiomicroscopyAnteriorApiSchema
>;
export type BiomicroscopyPosteriorApi = z.infer<
  typeof BiomicroscopyPosteriorApiSchema
>;
export type EyeExamApi = z.infer<typeof EyeExamApiSchema>;
export type PerimetryApi = z.infer<typeof PerimetryApiSchema>;
export type ConclusionApi = z.infer<typeof ConclusionApiSchema>;
export type ClinicalExamenApi = z.infer<typeof ClinicalExamenApiSchema>;
export type ExamenAdultDetailApi = z.infer<typeof ExamenAdultDetailApiSchema>;
export type VisionBinoculaireApi = z.infer<typeof VisionBinoculaireApiSchema>;
export type ExamenChildDetailApi = z.infer<typeof ExamenChildDetailApiSchema>;
