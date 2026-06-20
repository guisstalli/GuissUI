import { describe, expect, test } from 'vitest';

import { DEFAULT_ANALYTICS_FILTERS } from '../../types/types';
import { analyticsFiltersToSearchParams } from '../filters';

describe('analyticsFiltersToSearchParams', () => {
  test('sérialise patient_ids en paramètres répétables (pas une chaîne 1,2,3)', () => {
    const params = analyticsFiltersToSearchParams({
      ...DEFAULT_ANALYTICS_FILTERS,
      patient_ids: [10, 20, 30],
    });

    // Régression: un seul `patient_ids=10,20,30` cassait le backend
    // ("patient_ids[0]: un nombre entier valide est requis").
    expect(params.getAll('patient_ids')).toEqual(['10', '20', '30']);
  });

  test('sérialise site_id en paramètres répétables', () => {
    const params = analyticsFiltersToSearchParams({
      ...DEFAULT_ANALYTICS_FILTERS,
      site_id: [1, 2],
    });

    expect(params.getAll('site_id')).toEqual(['1', '2']);
  });

  test('omet les valeurs vides / undefined', () => {
    const params = analyticsFiltersToSearchParams({
      ...DEFAULT_ANALYTICS_FILTERS,
      patient_ids: undefined,
      symptom: undefined,
      date_start: '',
    });

    expect(params.has('patient_ids')).toBe(false);
    expect(params.has('symptom')).toBe(false);
    expect(params.has('date_start')).toBe(false);
  });

  test('conserve un filtre symptôme scalaire combiné à une cohorte', () => {
    const params = analyticsFiltersToSearchParams({
      ...DEFAULT_ANALYTICS_FILTERS,
      symptom: 'BAV',
      patient_ids: [5, 6],
    });

    expect(params.get('symptom')).toBe('BAV');
    expect(params.getAll('patient_ids')).toEqual(['5', '6']);
  });
});
