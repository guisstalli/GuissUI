import type {
  VisualAcuity,
  Refraction,
  OcularTension,
  Pachymetry,
  Plaintes,
  BiomicroscopyAnterior,
  BiomicroscopyPosterior,
  Perimetry,
  Conclusion,
  MedicalHistory,
} from '../types/types';

// =============================================================================
// FORM TO API MAPPERS - Technical Exam
// Ces mappers convertissent les noms de champs du formulaire vers les noms API
// =============================================================================

const toFixedDecimalString = (
  value: number | null | undefined,
  decimalPlaces = 3,
): string | null => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return null;
  }

  const normalized = Number(value.toFixed(decimalPlaces));
  return normalized.toString();
};

/**
 * Helper: Use corrected value if available, fallback to base/uncorrected if correction enabled
 * Prevents null fields when correction=true
 */
const coalesceValue = (
  correctedValue: number | null | undefined,
  baseValue: number | null | undefined,
): number | null | undefined => {
  if (correctedValue !== null && correctedValue !== undefined) {
    return correctedValue;
  }
  return baseValue ?? null;
};

/**
 * Visual Acuity - Les noms de champs sont identiques
 * Avec fallback: si correction=true mais champ absent, utilise la valeur sans correction
 */
export const mapVisualAcuityFormToApi = (data: VisualAcuity) => {
  const correction = data.correction ?? false;

  return {
    parinaud: toFixedDecimalString(data.parinaud),
    correction: data.correction,
    avsc_od: toFixedDecimalString(data.avsc_od),
    avsc_og: toFixedDecimalString(data.avsc_og),
    avsc_odg: toFixedDecimalString(data.avsc_odg),
    avac_od: toFixedDecimalString(data.avac_od),
    avac_og: toFixedDecimalString(data.avac_og),
    avac_odg: toFixedDecimalString(data.avac_odg),
    avsc_od_avec_correction: toFixedDecimalString(
      coalesceValue(
        data.avsc_od_avec_correction,
        correction ? data.avsc_od : null,
      ),
    ),
    avsc_og_avec_correction: toFixedDecimalString(
      coalesceValue(
        data.avsc_og_avec_correction,
        correction ? data.avsc_og : null,
      ),
    ),
    avsc_odg_avec_correction: toFixedDecimalString(
      coalesceValue(
        data.avsc_odg_avec_correction,
        correction ? data.avsc_odg : null,
      ),
    ),
    avac_od_avec_correction: toFixedDecimalString(
      coalesceValue(
        data.avac_od_avec_correction,
        correction ? data.avac_od : null,
      ),
    ),
    avac_og_avec_correction: toFixedDecimalString(
      coalesceValue(
        data.avac_og_avec_correction,
        correction ? data.avac_og : null,
      ),
    ),
    avac_odg_avec_correction: toFixedDecimalString(
      coalesceValue(
        data.avac_odg_avec_correction,
        correction ? data.avac_odg : null,
      ),
    ),
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
  const correction = data.correction ?? false;

  const odSphereAvecCorrection = coalesceValue(
    data.od_sphere_avec_correction,
    correction ? data.od_sphere : null,
  );
  const odCylinderAvecCorrection = coalesceValue(
    data.od_cylinder_avec_correction,
    correction ? data.od_cylinder : null,
  );
  const odAxisAvecCorrection = coalesceValue(
    data.od_axis_avec_correction,
    correction ? data.od_axis : null,
  );
  const ogSphereAvecCorrection = coalesceValue(
    data.og_sphere_avec_correction,
    correction ? data.og_sphere : null,
  );
  const ogCylinderAvecCorrection = coalesceValue(
    data.og_cylinder_avec_correction,
    correction ? data.og_cylinder : null,
  );
  const ogAxisAvecCorrection = coalesceValue(
    data.og_axis_avec_correction,
    correction ? data.og_axis : null,
  );
  const avodAvecCorrection = coalesceValue(
    data.od_visual_acuity_avec_correction,
    correction ? data.od_visual_acuity : null,
  );
  const avogAvecCorrection = coalesceValue(
    data.og_visual_acuity_avec_correction,
    correction ? data.og_visual_acuity : null,
  );
  const avodgAvecCorrection = coalesceValue(
    data.odg_visual_acuity_avec_correction,
    correction ? data.odg_visual_acuity : null,
  );

  return {
    correction,
    od_s: toFixedDecimalString(data.od_sphere),
    od_c: toFixedDecimalString(data.od_cylinder),
    od_a: toFixedDecimalString(data.od_axis),
    og_s: toFixedDecimalString(data.og_sphere),
    og_c: toFixedDecimalString(data.og_cylinder),
    og_a: toFixedDecimalString(data.og_axis),
    avod: toFixedDecimalString(data.od_visual_acuity),
    avog: toFixedDecimalString(data.og_visual_acuity),
    avodg: toFixedDecimalString(data.odg_visual_acuity),
    od_s_avec_correction: toFixedDecimalString(odSphereAvecCorrection),
    od_c_avec_correction: toFixedDecimalString(odCylinderAvecCorrection),
    od_a_avec_correction: toFixedDecimalString(odAxisAvecCorrection),
    og_s_avec_correction: toFixedDecimalString(ogSphereAvecCorrection),
    og_c_avec_correction: toFixedDecimalString(ogCylinderAvecCorrection),
    og_a_avec_correction: toFixedDecimalString(ogAxisAvecCorrection),
    avod_avec_correction: toFixedDecimalString(avodAvecCorrection),
    avog_avec_correction: toFixedDecimalString(avogAvecCorrection),
    avodg_avec_correction: toFixedDecimalString(avodgAvecCorrection),
    retinoscopie_focale_h: toFixedDecimalString(data.retino_od_sphere),
    retinoscopie_focale_v: toFixedDecimalString(data.retino_od_cylinder),
    retinoscopie_axe_h: toFixedDecimalString(data.retino_od_axis),
    retinoscopie_avec_focale_h: toFixedDecimalString(
      data.cyclo_od_sphere ?? data.retino_og_sphere ?? null,
    ),
    retinoscopie_avec_focale_v: toFixedDecimalString(
      data.cyclo_od_cylinder ?? data.retino_og_cylinder ?? null,
    ),
    retinoscopie_avec_axe_h: toFixedDecimalString(
      data.cyclo_od_axis ?? data.retino_og_axis ?? null,
    ),
    dp: toFixedDecimalString(data.dp),
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

/**
 * Plaintes - Mapper vers API
 */
export const mapPlaintesFormToApi = (data: Plaintes) => {
  return {
    eye_symptom: data.eye_symptom,
    autre: data.autre,
    diplopie: data.diplopie,
    diplopie_type: data.diplopie_type,
    strabisme: data.strabisme,
    strabisme_type: data.strabisme_type,
    strabisme_eye: data.strabisme_eye,
    nystagmus: data.nystagmus,
    nystagmus_eye: data.nystagmus_eye,
    ptosis: data.ptosis,
    ptosis_eye: data.ptosis_eye,
    ptosis_type: data.ptosis_type,
  };
};

/**
 * Biomicroscopy Anterior - Mapper vers API
 */
export const mapBiomicroscopyAnteriorFormToApi = (
  data: BiomicroscopyAnterior,
) => {
  return {
    segment: data.segment,
    cornee: data.cornee,
    cornee_autre: data.cornee_autre,
    profondeur: data.profondeur,
    transparence: data.transparence,
    type_anomalie_value: data.type_anomalie_value,
    type_anomalie_autre: data.type_anomalie_autre,
    quantite_anomalie: data.quantite_anomalie,
    pupille: data.pupille,
    axe_visuel: data.axe_visuel,
    rpm: data.rpm,
    iris: data.iris,
    iris_autres: data.iris_autres,
    cristallin: data.cristallin,
    position_cristallin: data.position_cristallin,
  };
};

/**
 * Biomicroscopy Posterior - Mapper vers API
 */
export const mapBiomicroscopyPosteriorFormToApi = (
  data: BiomicroscopyPosterior,
) => {
  return {
    segment: data.segment,
    vitre: data.vitre,
    vitre_autres: data.vitre_autres,
    papille: data.papille,
    papille_autres: data.papille_autres,
    macula: data.macula,
    retine_peripherique: data.retine_peripherique,
    retine_peripherique_autre: data.retine_peripherique_autre,
    vaissaux_retinien: data.vaissaux_retinien,
    cd: data.cd?.toString() || null,
    observation: data.observation,
  };
};

/**
 * Perimetry - Mapper vers API
 */
export const mapPerimetryFormToApi = (data: Perimetry) => {
  return {
    pbo: data.pbo,
    limite_superieure: data.limite_superieure?.toString() || null,
    limite_inferieure: data.limite_inferieure?.toString() || null,
    etendue_horizontal: data.etendue_horizontal?.toString() || null,
    limite_temporale_droit: data.limite_temporale_droit?.toString() || null,
    limite_temporale_gauche: data.limite_temporale_gauche?.toString() || null,
    score_esternmen: data.score_esternmen?.toString() || null,
  };
};

/**
 * Medical History - Mapper vers API
 */
export const mapMedicalHistoryFormToApi = (data: MedicalHistory) => {
  return {
    has_antecedents: data.has_antecedents,
    has_antecedents_medico_chirurgicaux:
      data.has_antecedents_medico_chirurgicaux,
    antecedents_medico_chirurgicaux: data.antecedents_medico_chirurgicaux,
    has_pathologie_ophtalmologique: data.has_pathologie_ophtalmologique,
    pathologie_ophtalmologique: data.pathologie_ophtalmologique,
    familial: data.familial,
    autre_familial_detail: data.autre_familial_detail,
    uses_screen: data.uses_screen,
    screen_time_hours_per_day: data.screen_time_hours_per_day,
  };
};

/**
 * Conclusion - Mapper vers API
 */
export const mapConclusionFormToApi = (data: Conclusion) => {
  return {
    vision: data.vision,
    cat: data.cat,
    traitement: data.traitement,
    observation: data.observation,
    diagnostic_cim_11: data.diagnostic_cim_11,
  };
};

/**
 * Mapper complet pour les données cliniques
 */
export const mapClinicalFormToApi = (data: {
  plaintes: Plaintes;
  perimetry: Perimetry;
  od: {
    bp_sg_anterieur: BiomicroscopyAnterior;
    bp_sg_posterieur: BiomicroscopyPosterior;
  };
  og: {
    bp_sg_anterieur: BiomicroscopyAnterior;
    bp_sg_posterieur: BiomicroscopyPosterior;
  };
  conclusion: Conclusion;
}) => {
  return {
    plaintes: mapPlaintesFormToApi(data.plaintes),
    perimetry: mapPerimetryFormToApi(data.perimetry),
    od: {
      bp_sg_anterieur: mapBiomicroscopyAnteriorFormToApi(
        data.od.bp_sg_anterieur,
      ),
      bp_sg_posterieur: mapBiomicroscopyPosteriorFormToApi(
        data.od.bp_sg_posterieur,
      ),
    },
    og: {
      bp_sg_anterieur: mapBiomicroscopyAnteriorFormToApi(
        data.og.bp_sg_anterieur,
      ),
      bp_sg_posterieur: mapBiomicroscopyPosteriorFormToApi(
        data.og.bp_sg_posterieur,
      ),
    },
    conclusion: mapConclusionFormToApi(data.conclusion),
  };
};
