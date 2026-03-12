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

/**
 * Visual Acuity - Les noms de champs sont identiques
 */
export const mapVisualAcuityFormToApi = (data: VisualAcuity) => {
  return {
    parinaud: data.parinaud?.toString() || null,
    correction: data.correction,
    avsc_od: data.avsc_od?.toString() || null,
    avsc_og: data.avsc_og?.toString() || null,
    avsc_odg: data.avsc_odg?.toString() || null,
    avac_od: data.avac_od?.toString() || null,
    avac_og: data.avac_og?.toString() || null,
    avac_odg: data.avac_odg?.toString() || null,
    avsc_od_avec_correction: data.avsc_od_avec_correction?.toString() || null,
    avsc_og_avec_correction: data.avsc_og_avec_correction?.toString() || null,
    avsc_odg_avec_correction: data.avsc_odg_avec_correction?.toString() || null,
    avac_od_avec_correction: data.avac_od_avec_correction?.toString() || null,
    avac_og_avec_correction: data.avac_og_avec_correction?.toString() || null,
    avac_odg_avec_correction: data.avac_odg_avec_correction?.toString() || null,
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
