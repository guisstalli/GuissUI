import { z } from 'zod';

import {
  AxeVisuelEnum,
  BiomicroscopyAnteriorSchema,
  BiomicroscopyPosteriorSchema,
  BpSupSchema,
  ClinicalCheckChildSchema,
  ClinicalCheckEnum,
  ClinicalExamSchema,
  ConclusionSchema,
  CorneeEnum,
  CoverTestDirectionEnum,
  CoverTestTypeEnum,
  CristallinEnum,
  DiplopieTypeEnum,
  ExamenAdultCompleteSchema,
  ExamenAdultCreateSchema,
  ExamenAdultDetailSchema,
  ExamenAdultProgressiveSchema,
  ExamenAdultSchema,
  ExamenChildCreateSchema,
  ExamenChildDetailSchema,
  ExamenChildSchema,
  ExamenSupplementaireCreateSchema,
  ExamenSupplementaireListSchema,
  ExamenSupplementaireSchema,
  EyeEnum,
  EyeSymptomEnum,
  HirschbergTypeEnum,
  IrisEnum,
  LateralityEnum,
  MaculaEnum,
  OcularTensionSchema,
  PachymetrySchema,
  PaginatedExamenAdultListSchema,
  PaginatedExamenChildListSchema,
  PaginatedExamenSupplementaireListSchema,
  PapilleEnum,
  PatientNestedSchema,
  PboEnum,
  PerimetrySchema,
  PlaintesSchema,
  PositionCristallinEnum,
  ProfondeurEnum,
  PupilleEnum,
  QuantiteAnomalieEnum,
  ReflexEnum,
  RefractionSchema,
  RetinienPeripheriqueEnum,
  RpmEnum,
  SectionEnum,
  SegmentEnum,
  StereoscopyLangEnum,
  TechnicalExamSchema,
  TransparenceEnum,
  TttHypotonisantEnum,
  TypeAnomalieValueEnum,
  VaissauxEnum,
  VisionAptitudeEnum,
  VisionBinoculaireSchema,
  VisualAcuitySchema,
  VitreEnum,
} from './schemas';

// =============================================================================
// ENUM TYPES
// =============================================================================

export type TttHypotonisant = z.infer<typeof TttHypotonisantEnum>;
export type HirschbergType = z.infer<typeof HirschbergTypeEnum>;
export type StereoscopyLang = z.infer<typeof StereoscopyLangEnum>;
export type Reflex = z.infer<typeof ReflexEnum>;
export type Laterality = z.infer<typeof LateralityEnum>;
export type CoverTestType = z.infer<typeof CoverTestTypeEnum>;
export type CoverTestDirection = z.infer<typeof CoverTestDirectionEnum>;
export type ClinicalCheck = z.infer<typeof ClinicalCheckEnum>;
export type EyeSymptom = z.infer<typeof EyeSymptomEnum>;
export type Eye = z.infer<typeof EyeEnum>;
export type DiplopieType = z.infer<typeof DiplopieTypeEnum>;
export type Pbo = z.infer<typeof PboEnum>;
export type Segment = z.infer<typeof SegmentEnum>;
export type Cornee = z.infer<typeof CorneeEnum>;
export type Profondeur = z.infer<typeof ProfondeurEnum>;
export type Transparence = z.infer<typeof TransparenceEnum>;
export type TypeAnomalieValue = z.infer<typeof TypeAnomalieValueEnum>;
export type QuantiteAnomalie = z.infer<typeof QuantiteAnomalieEnum>;
export type Pupille = z.infer<typeof PupilleEnum>;
export type AxeVisuel = z.infer<typeof AxeVisuelEnum>;
export type Rpm = z.infer<typeof RpmEnum>;
export type Iris = z.infer<typeof IrisEnum>;
export type Cristallin = z.infer<typeof CristallinEnum>;
export type PositionCristallin = z.infer<typeof PositionCristallinEnum>;
export type Vitre = z.infer<typeof VitreEnum>;
export type Papille = z.infer<typeof PapilleEnum>;
export type Macula = z.infer<typeof MaculaEnum>;
export type RetinienPeripherique = z.infer<typeof RetinienPeripheriqueEnum>;
export type Vaissaux = z.infer<typeof VaissauxEnum>;
export type VisionAptitude = z.infer<typeof VisionAptitudeEnum>;
export type Section = z.infer<typeof SectionEnum>;

// =============================================================================
// TECHNICAL DATA TYPES
// =============================================================================

export type VisualAcuity = z.infer<typeof VisualAcuitySchema>;
export type Refraction = z.infer<typeof RefractionSchema>;
export type OcularTension = z.infer<typeof OcularTensionSchema>;
export type Pachymetry = z.infer<typeof PachymetrySchema>;
export type VisionBinoculaire = z.infer<typeof VisionBinoculaireSchema>;
export type ClinicalCheckChild = z.infer<typeof ClinicalCheckChildSchema>;
export type TechnicalExam = z.infer<typeof TechnicalExamSchema>;

// =============================================================================
// CLINICAL DATA TYPES
// =============================================================================

export type Plaintes = z.infer<typeof PlaintesSchema>;
export type Perimetry = z.infer<typeof PerimetrySchema>;
export type BiomicroscopyAnterior = z.infer<typeof BiomicroscopyAnteriorSchema>;
export type BiomicroscopyPosterior = z.infer<
  typeof BiomicroscopyPosteriorSchema
>;
export type BpSup = z.infer<typeof BpSupSchema>;
export type Conclusion = z.infer<typeof ConclusionSchema>;
export type ClinicalExam = z.infer<typeof ClinicalExamSchema>;

// =============================================================================
// EXAMEN ADULTE TYPES
// =============================================================================

export type ExamenAdult = z.infer<typeof ExamenAdultSchema>;
export type ExamenAdultCreate = z.infer<typeof ExamenAdultCreateSchema>;
export type ExamenAdultDetail = z.infer<typeof ExamenAdultDetailSchema>;
export type ExamenAdultProgressive = z.infer<
  typeof ExamenAdultProgressiveSchema
>;
export type ExamenAdultComplete = z.infer<typeof ExamenAdultCompleteSchema>;
export type PaginatedExamenAdultList = z.infer<
  typeof PaginatedExamenAdultListSchema
>;
export type PatientNested = z.infer<typeof PatientNestedSchema>;

// Types pour les mutations d'ajout de données
export type ExamenAdultAddTechnical = z.infer<typeof TechnicalExamSchema>;
export type ExamenAdultAddClinical = z.infer<typeof ClinicalExamSchema>;

// =============================================================================
// EXAMEN ENFANT TYPES
// =============================================================================

export type ExamenChild = z.infer<typeof ExamenChildSchema>;
export type ExamenChildCreate = z.infer<typeof ExamenChildCreateSchema>;
export type ExamenChildDetail = z.infer<typeof ExamenChildDetailSchema>;
export type PaginatedExamenChildList = z.infer<
  typeof PaginatedExamenChildListSchema
>;

// Types pour les mutations enfant (alias pour cohérence API)
export type TechnicalExamenCreate = z.infer<typeof TechnicalExamSchema>;
export type ClinicalExamenCreate = z.infer<typeof ClinicalExamSchema>;

// =============================================================================
// PIÈCES JOINTES TYPES
// =============================================================================

export type ExamenSupplementaireList = z.infer<
  typeof ExamenSupplementaireListSchema
>;
export type ExamenSupplementaire = z.infer<typeof ExamenSupplementaireSchema>;
export type ExamenSupplementaireCreate = z.infer<
  typeof ExamenSupplementaireCreateSchema
>;
export type PaginatedExamenSupplementaireList = z.infer<
  typeof PaginatedExamenSupplementaireListSchema
>;

// =============================================================================
// QUERY PARAMS TYPES
// =============================================================================

/** Paramètres de requête pour la liste des examens */
export type ExamsQueryParams = {
  limit?: number;
  offset?: number;
  ordering?: string;
  search?: string;
  patient?: number;
  has_clinical?: boolean;
  has_technical?: boolean;
  is_completed?: boolean;
  created_after?: string;
  created_before?: string;
};
