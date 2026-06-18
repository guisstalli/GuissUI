import { z } from 'zod';

import {
  AgeBandSchema,
  AnalyticsFiltersSchema,
  AnalyticsOverviewSchema,
  AnalyticsTimelineSchema,
  AnalyticsSitesSchema,
  AnalyticsGlaucomaSchema,
  AnalyticsVisualAcuitySchema,
  AnalyticsRefractionSchema,
  AnalyticsOcularTensionSchema,
  AnalyticsPachymetrySchema,
  AnalyticsSymptomsSchema,
  AnalyticsRiskFactorsSchema,
  AnalyticsSymptomsFullSchema,
  AnalyticsBiomicroscopySchema,
  AnalyticsPediatricSchema,
  AnalyticsVisualFieldSchema,
  AnalyticsDriverExperienceSchema,
  AnalyticsScopeSchema,
  ExamScopeSchema,
  ExamTypeSchema,
  EyeStrategySchema,
  SexSchema,
  AcuityCategorySchema,
  TensionCategorySchema,
  ConclusionCategorySchema,
  SymptomCodeSchema,
  CohortSeveritySchema,
  CohortPatientItemSchema,
  CohortSummarySchema,
  CohortResponseSchema,
} from './schemas';

export type AnalyticsScope = z.infer<typeof AnalyticsScopeSchema>;
export type ExamType = z.infer<typeof ExamTypeSchema>;
export type Sex = z.infer<typeof SexSchema>;
export type AgeBand = z.infer<typeof AgeBandSchema>;
export type EyeStrategy = z.infer<typeof EyeStrategySchema>;
export type ExamScope = z.infer<typeof ExamScopeSchema>;
export type AnalyticsFilters = z.infer<typeof AnalyticsFiltersSchema>;

export type AcuityCategory = z.infer<typeof AcuityCategorySchema>;
export type TensionCategory = z.infer<typeof TensionCategorySchema>;
export type ConclusionCategory = z.infer<typeof ConclusionCategorySchema>;
export type SymptomCode = z.infer<typeof SymptomCodeSchema>;
export type CohortSeverity = z.infer<typeof CohortSeveritySchema>;
export type CohortPatientItem = z.infer<typeof CohortPatientItemSchema>;
export type CohortSummary = z.infer<typeof CohortSummarySchema>;
export type CohortResponse = z.infer<typeof CohortResponseSchema>;

/**
 * Critère clinique cliqué dans un graphique.
 * `type` est la clé envoyée au backend (acuity/tension/conclusion/symptom),
 * `value` la valeur du critère, `label` le libellé affiché dans le Sheet.
 */
export type CohortCriterion = {
  type: 'acuity' | 'tension' | 'conclusion' | 'symptom';
  value: string;
  label: string;
};

export const DEFAULT_ANALYTICS_FILTERS: AnalyticsFilters = {
  analytics_scope: 'population',
  exam_type: 'all',
  age_band: 'all',
  eye_strategy: 'separate',
  exam_scope: 'all',
};

export type AnalyticsOverview = z.infer<typeof AnalyticsOverviewSchema>;
export type AnalyticsTimeline = z.infer<typeof AnalyticsTimelineSchema>;
export type AnalyticsSites = z.infer<typeof AnalyticsSitesSchema>;
export type AnalyticsGlaucoma = z.infer<typeof AnalyticsGlaucomaSchema>;
export type AnalyticsVisualAcuity = z.infer<typeof AnalyticsVisualAcuitySchema>;
export type AnalyticsRefraction = z.infer<typeof AnalyticsRefractionSchema>;
export type AnalyticsOcularTension = z.infer<
  typeof AnalyticsOcularTensionSchema
>;
export type AnalyticsPachymetry = z.infer<typeof AnalyticsPachymetrySchema>;
export type AnalyticsSymptoms = z.infer<typeof AnalyticsSymptomsSchema>;
export type AnalyticsRiskFactors = z.infer<typeof AnalyticsRiskFactorsSchema>;
export type AnalyticsSymptomsFull = z.infer<typeof AnalyticsSymptomsFullSchema>;
export type AnalyticsBiomicroscopy = z.infer<
  typeof AnalyticsBiomicroscopySchema
>;
export type AnalyticsPediatric = z.infer<typeof AnalyticsPediatricSchema>;
export type AnalyticsVisualField = z.infer<typeof AnalyticsVisualFieldSchema>;
export type AnalyticsDriverExperience = z.infer<
  typeof AnalyticsDriverExperienceSchema
>;
