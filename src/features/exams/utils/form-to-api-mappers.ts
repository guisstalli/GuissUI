import type {
  VisualAcuity,
  Refraction,
  OcularTension,
  Pachymetry,
} from '../types/types';

// =============================================================================
// FORM TO API MAPPERS - Technical Exam
// Ces mappers convertissent les noms de champs du formulaire vers les noms API
// =============================================================================

/**
 * Visual Acuity - Les noms de champs sont identiques
 */
export const mapVisualAcuityFormToApi = (data: VisualAcuity) => {
  return {
    avsc_od: data.avsc_od,
    avsc_og: data.avsc_og,
    avsc_odg: data.avsc_odg,
    avac_od: data.avac_od,
    avac_og: data.avac_og,
    avac_odg: data.avac_odg,
  };
};

/**
 * Refraction - Convertir les noms de champs du formulaire vers l'API
 *
 * Formulaire → API:
 * - od_sphere → od_s
 * - od_cylinder → od_c
 * - od_axis → od_a
 * - etc.
 */
export const mapRefractionFormToApi = (data: Refraction) => {
  return {
    od_s: data.od_sphere,
    od_c: data.od_cylinder,
    od_a: data.od_axis,
    og_s: data.og_sphere,
    og_c: data.og_cylinder,
    og_a: data.og_axis,
    avod: data.od_visual_acuity,
    avog: data.og_visual_acuity,
    retinoscopie_focale_h: data.retino_od_sphere,
    retinoscopie_focale_v: data.retino_od_cylinder,
    retinoscopie_axe_h: data.retino_od_axis,
    retinoscopie_avec_focale_h: data.retino_og_sphere,
    retinoscopie_avec_focale_v: data.retino_og_cylinder,
    retinoscopie_avec_axe_h: data.retino_og_axis,
    dp: data.dp,
  };
};

/**
 * Ocular Tension - Les noms de champs sont identiques
 */
export const mapOcularTensionFormToApi = (data: OcularTension) => {
  return {
    od: data.od,
    og: data.og,
  };
};

/**
 * Pachymetry - Les noms de champs sont identiques
 */
export const mapPachymetryFormToApi = (data: Pachymetry) => {
  return {
    od: data.od,
    og: data.og,
    cto_od: data.cto_od,
    cto_og: data.cto_og,
  };
};

/**
 * Mapper complet pour les données techniques
 * Convertit les noms de champs du formulaire vers le format attendu par l'API
 */
export const mapTechnicalFormToApi = (data: {
  visualAcuity: VisualAcuity;
  refraction: Refraction;
  ocularTension: OcularTension;
  pachymetry: Pachymetry;
}) => {
  return {
    visual_acuity: mapVisualAcuityFormToApi(data.visualAcuity),
    refraction: mapRefractionFormToApi(data.refraction),
    ocular_tension: mapOcularTensionFormToApi(data.ocularTension),
    pachymetry: mapPachymetryFormToApi(data.pachymetry),
  };
};
