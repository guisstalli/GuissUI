import { describe, it, expect } from 'vitest';

import type {
  VisualAcuity,
  Refraction,
  OcularTension,
  Perimetry,
} from '../../types/types';
import {
  mapVisualAcuityFormToApi,
  mapRefractionFormToApi,
  mapOcularTensionFormToApi,
  mapTechnicalFormToApi,
  mapPerimetryFormToApi,
} from '../form-to-api-mappers';

// =============================================================================
// mapVisualAcuityFormToApi
// =============================================================================

describe('mapVisualAcuityFormToApi', () => {
  it('maps base fields without correction', () => {
    const data: VisualAcuity = {
      correction: false,
      avsc_od: 1.0,
      avsc_og: 0.8,
      avsc_odg: null,
    };
    const result = mapVisualAcuityFormToApi(data);
    expect(result.correction).toBe(false);
    expect(result.avsc_od).toBe('1');
    expect(result.avsc_og).toBe('0.8');
    expect(result.avac_od_prescrite).toBeNull();
    expect(result.avac_og_prescrite).toBeNull();
  });

  it('maps prescrite fields when correction=true', () => {
    const data: VisualAcuity = {
      correction: true,
      avsc_od: 0.5,
      avsc_og: 0.6,
      avsc_odg: null,
      avac_od: 0.9,
      avac_og: 0.85,
      avac_od_prescrite: 1.0,
      avac_og_prescrite: 0.95,
    };
    const result = mapVisualAcuityFormToApi(data);
    expect(result.correction).toBe(true);
    expect(result.avac_od_prescrite).toBe('1');
    expect(result.avac_og_prescrite).toBe('0.95');
  });

  it('falls back to avac when prescrite is null and correction=true', () => {
    const data: VisualAcuity = {
      correction: true,
      avsc_od: 0.5,
      avsc_og: 0.6,
      avsc_odg: null,
      avac_od: 0.9,
      avac_og: 0.85,
      avac_od_prescrite: null,
      avac_og_prescrite: null,
    };
    const result = mapVisualAcuityFormToApi(data);
    expect(result.avac_od_prescrite).toBe('0.9');
    expect(result.avac_og_prescrite).toBe('0.85');
  });
});

// =============================================================================
// mapRefractionFormToApi
// =============================================================================

describe('mapRefractionFormToApi', () => {
  const baseRefraction: Refraction = {
    correction: false,
    od_sphere: -1.5,
    od_cylinder: -0.5,
    od_axis: 90,
    od_visual_acuity: 0.8,
    og_sphere: -2.0,
    og_cylinder: -0.75,
    og_axis: 180,
    og_visual_acuity: 0.7,
  };

  it('sends null avec-correction fields when correction=false', () => {
    const result = mapRefractionFormToApi(baseRefraction);
    expect(result.correction).toBe(false);
    expect(result.od_s_avec_correction).toBeNull();
    expect(result.od_c_avec_correction).toBeNull();
    expect(result.od_a_avec_correction).toBeNull();
    expect(result.og_s_avec_correction).toBeNull();
    expect(result.og_c_avec_correction).toBeNull();
    expect(result.og_a_avec_correction).toBeNull();
    expect(result.avod_avec_correction).toBeNull();
    expect(result.avog_avec_correction).toBeNull();
    expect(result.avodg_avec_correction).toBeNull();
  });

  it('maps field names correctly: sphere → od_s, cylinder → od_c, axis → od_a', () => {
    const result = mapRefractionFormToApi(baseRefraction);
    expect(result.od_s).toBe('-1.5');
    expect(result.od_c).toBe('-0.5');
    expect(result.od_a).toBe('90');
    expect(result.og_s).toBe('-2');
    expect(result.og_c).toBe('-0.75');
    expect(result.og_a).toBe('180');
  });

  it('sends avec-correction values when correction=true and explicit values provided', () => {
    const data: Refraction = {
      ...baseRefraction,
      correction: true,
      od_sphere_avec_correction: -1.25,
      od_cylinder_avec_correction: -0.25,
      od_axis_avec_correction: 95,
      od_visual_acuity_avec_correction: 1.0,
      og_sphere_avec_correction: -1.75,
      og_cylinder_avec_correction: -0.5,
      og_axis_avec_correction: 175,
      og_visual_acuity_avec_correction: 0.9,
    };
    const result = mapRefractionFormToApi(data);
    expect(result.od_s_avec_correction).toBe('-1.25');
    expect(result.avod_avec_correction).toBe('1');
  });

  it('falls back to base values when avec_correction fields are null but correction=true', () => {
    const data: Refraction = {
      ...baseRefraction,
      correction: true,
      od_sphere_avec_correction: null,
      od_visual_acuity_avec_correction: null,
    };
    const result = mapRefractionFormToApi(data);
    expect(result.od_s_avec_correction).toBe('-1.5');
    expect(result.avod_avec_correction).toBe('0.8');
  });
});

// =============================================================================
// mapOcularTensionFormToApi
// =============================================================================

describe('mapOcularTensionFormToApi', () => {
  it('maps od and og values directly', () => {
    const data: OcularTension = { od: 14, og: 16 };
    const result = mapOcularTensionFormToApi(data);
    expect(result.od).toBe(14);
    expect(result.og).toBe(16);
  });

  it('passes null od/og through', () => {
    const data: OcularTension = { od: null, og: null };
    const result = mapOcularTensionFormToApi(data);
    expect(result.od).toBeNull();
    expect(result.og).toBeNull();
  });
});

// =============================================================================
// mapTechnicalFormToApi — clé ocular_tension (régression W3-BUG correction)
// =============================================================================

describe('mapTechnicalFormToApi', () => {
  it('uses ocular_tension key (not tension) in output', () => {
    const data = {
      visualAcuity: { correction: false } as VisualAcuity,
      refraction: { correction: false } as Refraction,
      ocularTension: { od: 15, og: 17 } as OcularTension,
      pachymetry: { od: null, og: null, cto_od: null, cto_og: null },
    };
    const result = mapTechnicalFormToApi(data);
    expect(result).toHaveProperty('ocular_tension');
    expect(result).not.toHaveProperty('tension');
    expect(result.ocular_tension.od).toBe(15);
    expect(result.ocular_tension.og).toBe(17);
  });
});

// =============================================================================
// mapPerimetryFormToApi — examens_additionnels (régression W3-BUG correction)
// =============================================================================

describe('mapPerimetryFormToApi', () => {
  it('includes examens_additionnels in output', () => {
    const examens = [
      { titre: 'OCT', type_valeur: 'text' as const, value: 'normal' },
      { titre: 'ERG', type_valeur: 'text' as const, value: 'anormal' },
    ];
    const data: Perimetry = {
      pbo: ['NORMAL'],
      examens_additionnels: examens,
    };
    const result = mapPerimetryFormToApi(data);
    expect(result).toHaveProperty('examens_additionnels');
    expect(result.examens_additionnels).toHaveLength(2);
    expect(result.examens_additionnels[0].titre).toBe('OCT');
  });

  it('defaults examens_additionnels to empty array when undefined', () => {
    const data = {
      pbo: ['NORMAL'] as Perimetry['pbo'],
      examens_additionnels: undefined,
    } as unknown as Perimetry;
    const result = mapPerimetryFormToApi(data);
    expect(result.examens_additionnels).toEqual([]);
  });

  it('maps numeric fields to string', () => {
    const data: Perimetry = {
      pbo: ['NORMAL'],
      limite_superieure: 60,
      limite_inferieure: 60,
      examens_additionnels: [],
    };
    const result = mapPerimetryFormToApi(data);
    expect(result.limite_superieure).toBe('60');
    expect(result.limite_inferieure).toBe('60');
  });
});
