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
} from './schemas';

export type AnalyticsScope = z.infer<typeof AnalyticsScopeSchema>;
export type ExamType = z.infer<typeof ExamTypeSchema>;
export type Sex = z.infer<typeof SexSchema>;
export type AgeBand = z.infer<typeof AgeBandSchema>;
export type EyeStrategy = z.infer<typeof EyeStrategySchema>;
export type ExamScope = z.infer<typeof ExamScopeSchema>;
export type AnalyticsFilters = z.infer<typeof AnalyticsFiltersSchema>;
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
