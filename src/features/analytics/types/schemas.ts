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
  driver_only: z.boolean().optional(),
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

// =============================================================================
// NEW ANALYTICS SCHEMAS
// =============================================================================

export const AnalyticsRiskFactorsSchema = z.object({
  filters: AnalyticsFiltersSchema,
  sample_size: z.number(),
  screen_usage: z.object({
    uses_screen_pct: z.number(),
    mean_hours_per_day: z.number().nullable(),
    screen_users_count: z.number(),
  }),
  family_history: z.object({
    has_familial_pct: z.number(),
    cecite_pct: z.number(),
    gpao_pct: z.number(),
    other_pct: z.number(),
  }),
  medical_antecedents: z.object({
    has_medical_pct: z.number(),
    has_ophthalmic_pct: z.number(),
    top_ophthalmic: z.array(
      z.object({ name: z.string(), count: z.number() }),
    ),
  }),
  addiction: z.object({
    has_addiction_pct: z.number(),
    type_distribution: z.object({
      TABAGISME_pct: z.number(),
      ALCOOL_pct: z.number(),
      AUTRES_pct: z.number(),
    }),
  }),
});

export const AnalyticsSymptomsFullSchema = z.object({
  filters: AnalyticsFiltersSchema,
  sample_size: z.number(),
  no_symptom_pct: z.number(),
  symptom_distribution: z.array(
    z.object({ symptom: z.string(), count: z.number(), pct: z.number() }),
  ),
  diplopie_detail: z.object({
    sample_size: z.number(),
    monoculaire_pct: z.number(),
    binoculaire_pct: z.number(),
  }),
  strabisme_detail: z.object({
    sample_size: z.number(),
    convergent_pct: z.number(),
    divergent_pct: z.number(),
    od_pct: z.number(),
    og_pct: z.number(),
    odg_pct: z.number(),
  }),
});

const _SegmentStatsSchema = <T extends z.ZodRawShape>(extraFields: T) =>
  z.object({
    sample_size: z.number(),
    distribution: z.record(z.number()),
    ...extraFields,
  });

export const AnalyticsBiomicroscopySchema = z.object({
  filters: AnalyticsFiltersSchema,
  anterior: z.object({
    segment_distribution: z.record(z.number()),
    cristallin: _SegmentStatsSchema({
      normal_pct: z.number(),
      opaque_pct: z.number(),
      pseudophakie_pct: z.number(),
      colobome_pct: z.number(),
      aphakie_pct: z.number(),
    }),
    cornee: _SegmentStatsSchema({
      normal_pct: z.number(),
      opacite_axe_pct: z.number(),
      opacite_peripherie_pct: z.number(),
      opacite_totale_pct: z.number(),
    }),
  }),
  posterior: z.object({
    segment_distribution: z.record(z.number()),
    papille: _SegmentStatsSchema({
      normale_pct: z.number(),
      excavation_elargie_pct: z.number(),
      atrophie_pct: z.number(),
      oedeme_pct: z.number(),
    }),
    macula: _SegmentStatsSchema({
      normal_pct: z.number(),
      dmla_pct: z.number(),
      oedeme_pct: z.number(),
      cicatrice_pct: z.number(),
    }),
    vaisseaux_retiniens: _SegmentStatsSchema({
      normaux_pct: z.number(),
      arteriosclerose_pct: z.number(),
      ovr_pct: z.number(),
      oar_pct: z.number(),
    }),
    retine_peripherique: _SegmentStatsSchema({
      normal_pct: z.number(),
      dehiscence_pct: z.number(),
      hemorragie_pct: z.number(),
    }),
  }),
});

const _CoverTestSchema = z.object({
  sample_size: z.number(),
  orthotropie_pct: z.number(),
  tropie_pct: z.number(),
  phorie_pct: z.number(),
});

export const AnalyticsPediatricSchema = z.object({
  filters: AnalyticsFiltersSchema,
  sample_size: z.number(),
  alignment: z.object({
    orthotropie_pct: z.number(),
    esotropie_pct: z.number(),
    exotropie_pct: z.number(),
    distribution: z.record(z.number()),
  }),
  stereopsis_lang_ii: z.object({
    tested_pct: z.number(),
    success_count: z.number(),
    success_pct: z.number(),
  }),
  cover_test_vl: _CoverTestSchema,
  cover_test_vp: _CoverTestSchema,
});

export const AnalyticsVisualFieldSchema = z.object({
  filters: AnalyticsFiltersSchema,
  sample_size: z.number(),
  esterman_mean: z.number().nullable(),
  defect_distribution: z.array(
    z.object({ value: z.string(), count: z.number(), pct: z.number() }),
  ),
  mean_field_extents: z.object({
    superieure_mean: z.number().nullable(),
    inferieure_mean: z.number().nullable(),
    horizontal_mean: z.number().nullable(),
  }),
});

export const AnalyticsDriverExperienceSchema = z.object({
  filters: AnalyticsFiltersSchema,
  sample_size: z.number(),
  etat_conducteur: z.record(
    z.object({ count: z.number(), pct: z.number() }),
  ),
  accidents: z.object({
    mean_accidents_per_driver: z.number().nullable(),
    drivers_with_accident_pct: z.number(),
    corporel_dommage_pct: z.number(),
    materiel_dommage_pct: z.number(),
    accident_per_visit: z.array(
      z.object({ visit: z.number(), mean_accidents: z.number().nullable() }),
    ),
  }),
  av_vs_accidents: z.array(
    z.object({
      av_range: z.string(),
      mean_accidents: z.number().nullable(),
      count: z.number(),
    }),
  ),
});
