import type { AnalyticsFilters, ExamType } from '../types';

type CommonAnalyticsFilterOverrides = Partial<
  Pick<
    AnalyticsFilters,
    | 'date_start'
    | 'date_end'
    | 'site_id'
    | 'sex'
    | 'age_band'
    | 'eye_strategy'
    | 'exam_scope'
  >
>;

const DETAIL_DEFAULTS: Pick<
  AnalyticsFilters,
  'age_band' | 'eye_strategy' | 'exam_scope'
> = {
  age_band: 'all',
  eye_strategy: 'separate',
  exam_scope: 'all',
};

export const buildPatientAnalyticsFilters = (
  patientId: number,
  overrides: CommonAnalyticsFilterOverrides = {},
): AnalyticsFilters => {
  return {
    ...DETAIL_DEFAULTS,
    ...overrides,
    analytics_scope: 'patient',
    exam_type: 'all',
    patient_id: patientId,
    exam_id: undefined,
  };
};

export const buildExamAnalyticsFilters = (
  examId: number,
  examType: Extract<ExamType, 'adult' | 'child'>,
  overrides: CommonAnalyticsFilterOverrides = {},
): AnalyticsFilters => {
  return {
    ...DETAIL_DEFAULTS,
    ...overrides,
    analytics_scope: 'exam',
    exam_type: examType,
    exam_id: examId,
    patient_id: undefined,
  };
};
