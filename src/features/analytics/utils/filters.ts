import type { AnalyticsFilters } from '../types';

export type AnalyticsFilterValidation = {
  isValid: boolean;
  message?: string;
};

const normalizeNumber = (value?: number) => {
  if (value === undefined || Number.isNaN(value)) {
    return undefined;
  }

  return value;
};

export const normalizeAnalyticsFilters = (
  filters: AnalyticsFilters,
): AnalyticsFilters => {
  const normalizedSiteIds = filters.site_id?.filter(
    (siteId) => typeof siteId === 'number' && !Number.isNaN(siteId),
  );

  const normalized: AnalyticsFilters = {
    date_start: filters.date_start || undefined,
    date_end: filters.date_end || undefined,
    analytics_scope: filters.analytics_scope ?? 'population',
    exam_type: filters.exam_type ?? 'all',
    patient_id: normalizeNumber(filters.patient_id),
    exam_id: normalizeNumber(filters.exam_id),
    site_id: normalizedSiteIds?.length ? normalizedSiteIds : undefined,
    sex: filters.sex,
    age_band: filters.age_band ?? 'all',
    eye_strategy: filters.eye_strategy ?? 'separate',
    exam_scope: filters.exam_scope ?? 'all',
  };

  if (normalized.analytics_scope !== 'patient') {
    normalized.patient_id = undefined;
  }

  if (normalized.analytics_scope !== 'exam') {
    normalized.exam_id = undefined;
  }

  if (normalized.analytics_scope === 'exam' && normalized.exam_type === 'all') {
    normalized.exam_type = 'adult';
  }

  return normalized;
};

export const validateAnalyticsFilters = (
  filters: AnalyticsFilters,
): AnalyticsFilterValidation => {
  if (
    filters.date_start &&
    filters.date_end &&
    filters.date_start > filters.date_end
  ) {
    return {
      isValid: false,
      message:
        'La date de début doit être antérieure ou égale à la date de fin.',
    };
  }

  if (filters.analytics_scope === 'patient' && !filters.patient_id) {
    return {
      isValid: false,
      message: 'Le filtre patient est requis lorsque la portée est Patient.',
    };
  }

  if (filters.analytics_scope === 'exam') {
    if (!filters.exam_id) {
      return {
        isValid: false,
        message: 'Le filtre examen est requis lorsque la portée est Examen.',
      };
    }

    if (!filters.exam_type || filters.exam_type === 'all') {
      return {
        isValid: false,
        message:
          'Le type d’examen doit être Adulte ou Enfant en portée Examen.',
      };
    }
  }

  if (
    filters.exam_id &&
    filters.analytics_scope !== 'exam' &&
    (!filters.exam_type || filters.exam_type === 'all')
  ) {
    return {
      isValid: false,
      message:
        'Si un examen est saisi hors portée Examen, le type doit être Adulte ou Enfant.',
    };
  }

  return { isValid: true };
};
