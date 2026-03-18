import { z } from 'zod';

export const ANALYTICS_SCOPE_VALUES = [
  'population',
  'patient',
  'exam',
] as const;
export const EXAM_TYPE_VALUES = ['all', 'child', 'adult'] as const;
export const SEX_VALUES = ['H', 'F', 'A'] as const;
export const AGE_BAND_VALUES = ['all', 'child', 'adult', 'over_40'] as const;
export const EYE_STRATEGY_VALUES = ['separate', 'average', 'worst'] as const;
export const EXAM_SCOPE_VALUES = ['all', 'first'] as const;

export const AnalyticsScopeSchema = z.enum(ANALYTICS_SCOPE_VALUES);
export const ExamTypeSchema = z.enum(EXAM_TYPE_VALUES);
export const SexSchema = z.enum(SEX_VALUES);
export const AgeBandSchema = z.enum(AGE_BAND_VALUES);
export const EyeStrategySchema = z.enum(EYE_STRATEGY_VALUES);
export const ExamScopeSchema = z.enum(EXAM_SCOPE_VALUES);

export const AnalyticsFiltersSchema = z.object({
  date_start: z.string().optional(),
  date_end: z.string().optional(),
  analytics_scope: AnalyticsScopeSchema.optional(),
  exam_type: ExamTypeSchema.optional(),
  patient_id: z.number().optional(),
  exam_id: z.number().optional(),
  site_id: z.array(z.number()).optional(),
  sex: SexSchema.optional(),
  age_band: AgeBandSchema.optional(),
  eye_strategy: EyeStrategySchema.optional(),
  exam_scope: ExamScopeSchema.optional(),
});

export const AnalyticsOverviewSchema = z.object({
  filters: AnalyticsFiltersSchema,
  population: z.object({
    patients_total: z.number(),
    examens_total: z.number(),
    age_mean: z.number().nullable(),
    sex_distribution: z.record(z.number()),
  }),
});

export const AnalyticsTimelineItemSchema = z.object({
  date: z.string(),
  child_examens: z.number(),
  adult_examens: z.number(),
  total_examens: z.number(),
});
export const AnalyticsTimelineSchema = z.object({
  filters: AnalyticsFiltersSchema,
  timeline: z.array(AnalyticsTimelineItemSchema),
});

export const AnalyticsSiteItemSchema = z.object({
  site_id: z.number().nullable(),
  site_libelle: z.string(),
  patients_total: z.number(),
  examens_total: z.number(),
  av_mean: z.number().nullable(),
  to_mean: z.number().nullable(),
});
export const AnalyticsSitesSchema = z.object({
  filters: AnalyticsFiltersSchema,
  sites: z.array(AnalyticsSiteItemSchema),
});

export const AnalyticsGlaucomaItemSchema = z.object({
  to: z.number(),
  cd: z.number(),
});
export const AnalyticsGlaucomaSchema = z.object({
  filters: AnalyticsFiltersSchema,
  kpis: z.object({
    cd_mean: z.number().nullable(),
    pct_cd_above_03: z.number(),
    pct_cd_above_06: z.number(),
    glaucoma_suspect_count: z.number(),
    glaucoma_high_risk_count: z.number(),
    sample_size: z.number(),
  }),
  scatter_to_cd: z.array(AnalyticsGlaucomaItemSchema),
});

export const AnalyticsVisualAcuitySchema = z.object({
  filters: AnalyticsFiltersSchema,
  kpis: z.object({
    av_mean: z.number().nullable(),
    pct_av_less_than_10: z.number(),
    pct_av_less_than_5: z.number(),
    pct_av_less_than_3: z.number(),
    sample_size: z.number(),
  }),
});

export const AnalyticsRefractionSchema = z.object({
  filters: AnalyticsFiltersSchema,
  kpis: z.object({
    eqs_mean: z.number().nullable(),
    pct_myope: z.number(),
    pct_hypermetrope: z.number(),
    pct_normal: z.number(),
    sample_size: z.number(),
  }),
});

export const AnalyticsOcularTensionSchema = z.object({
  filters: AnalyticsFiltersSchema,
  kpis: z.object({
    to_mean: z.number().nullable(),
    pct_to_above_21: z.number(),
    pct_to_above_25: z.number(),
    sample_size: z.number(),
  }),
});

export const AnalyticsPachymetrySchema = z.object({
  filters: AnalyticsFiltersSchema,
  kpis: z.object({
    pachymetry_mean: z.number().nullable(),
    sample_size: z.number(),
  }),
});

export const AnalyticsSymptomsSchema = z.object({
  filters: AnalyticsFiltersSchema,
  kpis: z.object({
    symptoms: z.record(z.number()),
    top_diagnostics: z.array(z.tuple([z.string(), z.number()])),
    esterman_mean: z.number().nullable(),
    esterman_sample_size: z.number(),
  }),
});
