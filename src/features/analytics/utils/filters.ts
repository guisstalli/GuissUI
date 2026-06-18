import type { AnalyticsFilters } from '../types/types';

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

/**
 * Sérialise les filtres analytiques en query params.
 * Toute valeur tableau (site_id, patient_ids…) est ajoutée en paramètres
 * répétables (`patient_ids=1&patient_ids=2`) — JAMAIS jointe en une chaîne
 * `1,2,3`, sinon le backend la lit comme un seul entier et renvoie une
 * « Validation error » sur patient_ids/site_id.
 */
export const analyticsFiltersToSearchParams = (
  filters: AnalyticsFilters,
): URLSearchParams => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === undefined || item === null) {
          return;
        }
        params.append(key, String(item));
      });
      return;
    }

    params.set(key, String(value));
  });

  return params;
};

export const normalizeAnalyticsFilters = (
  filters: AnalyticsFilters,
): AnalyticsFilters => {
  const normalizedSiteIds = filters.site_id?.filter(
    (siteId) => typeof siteId === 'number' && !Number.isNaN(siteId),
  );

  const normalizedPatientIds = filters.patient_ids?.filter(
    (patientId) => typeof patientId === 'number' && !Number.isNaN(patientId),
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
    driver_only: filters.driver_only,
    acuity: filters.acuity,
    tension: filters.tension,
    conclusion: filters.conclusion,
    symptom: filters.symptom,
    patient_ids: normalizedPatientIds?.length
      ? normalizedPatientIds
      : undefined,
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
