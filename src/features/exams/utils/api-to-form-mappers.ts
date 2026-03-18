import type {
  VisualAcuityApi,
  RefractionApi,
  OcularTensionApi,
  PachymetryApi,
  PlaintesApi,
  BiomicroscopyAnteriorApi,
  BiomicroscopyPosteriorApi,
  PerimetryApi,
  ConclusionApi,
  VisionBinoculaireApi,
  MedicalHistoryApi,
} from '../types/api-schemas';
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
  VisionBinoculaire,
  MedicalHistory,
  ClinicalCheckChild,
  Segment,
  Pbo,
  EyeSymptom,
  VisionAptitude,
  DiplopieType,
  StrabismeType,
  PtosisType,
  Eye,
  Vaissaux,
} from '../types/types';

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Convertit une string en number ou retourne null/undefined
 */
export const toNumber = (
  value: string | null | undefined,
): number | null | undefined => {
  if (value === null) return null;
  if (value === undefined) return undefined;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
};

/**
 * Convertit un number en string pour l'envoi à l'API
 */
export const toString = (
  value: number | null | undefined,
): string | null | undefined => {
  if (value === null) return null;
  if (value === undefined) return undefined;
  return value.toString();
};

// =============================================================================
// TECHNICAL EXAM MAPPERS
// =============================================================================

/**
 * Mappe les données API de Visual Acuity vers les données de formulaire
 */
export const mapVisualAcuityApiToForm = (
  data: VisualAcuityApi | null | undefined,
): VisualAcuity | undefined => {
  if (!data) return undefined;
  return {
    parinaud: toNumber(data.parinaud),
    correction: data.correction ?? false,
    avsc_od: toNumber(data.avsc_od),
    avsc_og: toNumber(data.avsc_og),
    avsc_odg: toNumber(data.avsc_odg),
    avac_od: toNumber(data.avac_od),
    avac_og: toNumber(data.avac_og),
    avac_odg: toNumber(data.avac_odg),
    avsc_od_avec_correction: toNumber(data.avsc_od_avec_correction),
    avsc_og_avec_correction: toNumber(data.avsc_og_avec_correction),
    avsc_odg_avec_correction: toNumber(data.avsc_odg_avec_correction),
    avac_od_avec_correction: toNumber(data.avac_od_avec_correction),
    avac_og_avec_correction: toNumber(data.avac_og_avec_correction),
    avac_odg_avec_correction: toNumber(data.avac_odg_avec_correction),
  };
};

/**
 * Mappe les données API de Refraction vers les données de formulaire
 *
 * Mapping API → Formulaire:
 *
 * Réfraction standard:
 * - od_s → od_sphere (Sphère OD)
 * - od_c → od_cylinder (Cylindre OD)
 * - od_a → od_axis (Axe OD)
 * - avod → od_visual_acuity (Acuité visuelle OD)
 * - og_s → og_sphere (Sphère OG)
 * - og_c → og_cylinder (Cylindre OG)
 * - og_a → og_axis (Axe OG)
 * - avog → og_visual_acuity (Acuité visuelle OG)
 *
 * Rétinoscopie OD:
 * - retinoscopie_focale_h → retino_od_sphere (Focale Horizontale)
 * - retinoscopie_focale_v → retino_od_cylinder (Focale Verticale)
 * - retinoscopie_axe_h → retino_od_axis (Axe Horizontal)
 *
 * Rétinoscopie OG:
 * - retinoscopie_avec_focale_h → retino_og_sphere (Focale Horizontale)
 * - retinoscopie_avec_focale_v → retino_og_cylinder (Focale Verticale)
 * - retinoscopie_avec_axe_h → retino_og_axis (Axe Horizontal)
 *
 * Global:
 * - dp → dp (Distance pupillaire)
 */
export const mapRefractionApiToForm = (
  data: RefractionApi | null | undefined,
): Refraction | undefined => {
  if (!data) return undefined;
  return {
    correction: data.correction ?? false,
    // Réfraction standard OD
    od_sphere: toNumber(data.od_s),
    od_cylinder: toNumber(data.od_c),
    od_axis: toNumber(data.od_a),
    od_visual_acuity: toNumber(data.avod),
    // Réfraction standard OG
    og_sphere: toNumber(data.og_s),
    og_cylinder: toNumber(data.og_c),
    og_axis: toNumber(data.og_a),
    og_visual_acuity: toNumber(data.avog),
    odg_visual_acuity: toNumber(data.avodg),
    // Champs avec correction
    od_sphere_avec_correction: toNumber(data.od_s_avec_correction),
    od_cylinder_avec_correction: toNumber(data.od_c_avec_correction),
    od_axis_avec_correction: toNumber(data.od_a_avec_correction),
    og_sphere_avec_correction: toNumber(data.og_s_avec_correction),
    og_cylinder_avec_correction: toNumber(data.og_c_avec_correction),
    og_axis_avec_correction: toNumber(data.og_a_avec_correction),
    od_visual_acuity_avec_correction: toNumber(data.avod_avec_correction),
    og_visual_acuity_avec_correction: toNumber(data.avog_avec_correction),
    odg_visual_acuity_avec_correction: toNumber(data.avodg_avec_correction),
    // Rétinoscopie OD (Focale H, Focale V, Axe H)
    retino_od_sphere: toNumber(data.retinoscopie_focale_h),
    retino_od_cylinder: toNumber(data.retinoscopie_focale_v),
    retino_od_axis: toNumber(data.retinoscopie_axe_h),
    // Rétinoscopie OG (même base que standard, backend sans différenciation OG)
    retino_og_sphere: toNumber(data.retinoscopie_focale_h),
    retino_og_cylinder: toNumber(data.retinoscopie_focale_v),
    retino_og_axis: toNumber(data.retinoscopie_axe_h),
    // Rétinoscopie cycloplégique
    cyclo_od_sphere: toNumber(data.retinoscopie_avec_focale_h),
    cyclo_od_cylinder: toNumber(data.retinoscopie_avec_focale_v),
    cyclo_od_axis: toNumber(data.retinoscopie_avec_axe_h),
    cyclo_og_sphere: toNumber(data.retinoscopie_avec_focale_h),
    cyclo_og_cylinder: toNumber(data.retinoscopie_avec_focale_v),
    cyclo_og_axis: toNumber(data.retinoscopie_avec_axe_h),
    // Distance pupillaire
    dp: toNumber(data.dp),
  };
};

/**
 * Mappe les données API de Ocular Tension vers les données de formulaire
 */
export const mapOcularTensionApiToForm = (
  data: OcularTensionApi | null | undefined,
): OcularTension | undefined => {
  if (!data) return undefined;
  return {
    od: toNumber(data.od),
    og: toNumber(data.og),
    ttt_hypotonisant: false,
    ttt_hypotonisant_value: null,
  };
};

/**
 * Mappe les données API de Pachymetry vers les données de formulaire
 */
export const mapPachymetryApiToForm = (
  data: PachymetryApi | null | undefined,
): Pachymetry | undefined => {
  if (!data) return undefined;
  return {
    od: toNumber(data.od),
    og: toNumber(data.og),
    cto_od: data.cto_od ?? null,
    cto_og: data.cto_og ?? null,
  };
};

// =============================================================================
// CLINICAL EXAM MAPPERS
// =============================================================================

/**
 * Mappe les données API de Plaintes vers les données de formulaire
 */
export const mapPlaintesApiToForm = (
  data: PlaintesApi | null | undefined,
): Plaintes | undefined => {
  if (!data) return undefined;
  return {
    eye_symptom: (data.eye_symptom || []) as EyeSymptom[],
    autre: data.autre ?? null,
    diplopie: data.diplopie ?? false,
    diplopie_type: data.diplopie_type as DiplopieType | null,
    strabisme: data.strabisme ?? false,
    strabisme_type: data.strabisme_type as StrabismeType | null,
    strabisme_eye: data.strabisme_eye as Eye | null,
    nystagmus: data.nystagmus ?? false,
    nystagmus_eye: data.nystagmus_eye as Eye | null,
    ptosis: data.ptosis ?? false,
    ptosis_eye: data.ptosis_eye as Eye | null,
    ptosis_type: data.ptosis_type as PtosisType | null,
  };
};

/**
 * Mappe les données API de Biomicroscopy Anterior vers les données de formulaire
 */
export const mapBiomicroscopyAnteriorApiToForm = (
  data: BiomicroscopyAnteriorApi | null | undefined,
): BiomicroscopyAnterior | undefined => {
  if (!data) return undefined;
  return {
    segment: (data.segment || 'NORMAL') as Segment,
    cornee: data.cornee as BiomicroscopyAnterior['cornee'],
    cornee_autre: data.cornee_autre ?? null,
    profondeur: data.profondeur as BiomicroscopyAnterior['profondeur'],
    transparence: data.transparence as BiomicroscopyAnterior['transparence'],
    type_anomalie_value:
      data.type_anomalie_value as BiomicroscopyAnterior['type_anomalie_value'],
    type_anomalie_autre: data.type_anomalie_autre ?? null,
    quantite_anomalie:
      data.quantite_anomalie as BiomicroscopyAnterior['quantite_anomalie'],
    pupille: data.pupille as BiomicroscopyAnterior['pupille'],
    axe_visuel: data.axe_visuel as BiomicroscopyAnterior['axe_visuel'],
    rpm: data.rpm as BiomicroscopyAnterior['rpm'],
    iris: data.iris as BiomicroscopyAnterior['iris'],
    iris_autres: data.iris_autres ?? null,
    cristallin: data.cristallin as BiomicroscopyAnterior['cristallin'],
    position_cristallin:
      data.position_cristallin as BiomicroscopyAnterior['position_cristallin'],
  };
};

/**
 * Mappe les données API de Biomicroscopy Posterior vers les données de formulaire
 */
export const mapBiomicroscopyPosteriorApiToForm = (
  data: BiomicroscopyPosteriorApi | null | undefined,
): BiomicroscopyPosterior | undefined => {
  if (!data) return undefined;
  return {
    segment: (data.segment || 'NORMAL') as Segment,
    vitre: data.vitre as BiomicroscopyPosterior['vitre'],
    vitre_autres: data.vitre_autres ?? null,
    papille: data.papille as BiomicroscopyPosterior['papille'],
    papille_autres: data.papille_autres ?? null,
    macula: data.macula as BiomicroscopyPosterior['macula'],
    retine_peripherique:
      data.retine_peripherique as BiomicroscopyPosterior['retine_peripherique'],
    retine_peripherique_autre: data.retine_peripherique_autre ?? null,
    vaissaux_retinien: data.vaissaux_retinien as Vaissaux | null,
    cd: toNumber(data.cd),
    observation: data.observation ?? null,
  };
};

/**
 * Mappe les données API de Perimetry vers les données de formulaire
 */
export const mapPerimetryApiToForm = (
  data: PerimetryApi | null | undefined,
): Perimetry | undefined => {
  if (!data) return undefined;
  return {
    pbo: (data.pbo || []) as Pbo[],
    limite_superieure: toNumber(data.limite_superieure),
    limite_inferieure: toNumber(data.limite_inferieure),
    limite_temporale_droit: toNumber(data.limite_temporale_droit),
    limite_temporale_gauche: toNumber(data.limite_temporale_gauche),
    etendue_horizontal: toNumber(data.etendue_horizontal),
    score_esternmen: toNumber(data.score_esternmen),
    image: null,
    images: null,
  };
};

/**
 * Mappe les données API de Conclusion vers les données de formulaire
 */
export const mapConclusionApiToForm = (
  data: ConclusionApi | null | undefined,
): Conclusion | undefined => {
  if (!data) return undefined;
  return {
    vision: data.vision as VisionAptitude | null,
    cat: data.cat ?? null,
    traitement: data.traitement ?? null,
    observation: data.observation ?? null,
    //rv: false,
    //date_prochain_rendez_vous: null,
    diagnostic_cim_11: data.diagnostic_cim_11 ?? null,
  };
};

// =============================================================================
// CHILD EXAM MAPPERS
// =============================================================================

/**
 * Mappe les données API de Vision Binoculaire vers les données de formulaire
 */
export const mapVisionBinoculaireApiToForm = (
  data: VisionBinoculaireApi | null | undefined,
): VisionBinoculaire | undefined => {
  if (!data) return undefined;
  return {
    hirschberg_type:
      data.hirschberg_type as VisionBinoculaire['hirschberg_type'],
    hirschberg_detail:
      data.hirschberg_detail as VisionBinoculaire['hirschberg_detail'],
    stereoscopy_lang:
      data.stereoscopie_lang_ii as VisionBinoculaire['stereoscopy_lang'],
    pupillary_reflex:
      data.reflet_pupillaire as VisionBinoculaire['pupillary_reflex'],
    pupillary_reflex_laterality:
      data.reflet_lateralite as VisionBinoculaire['pupillary_reflex_laterality'],
    cover_test_vl_type:
      data.cover_vl_type as VisionBinoculaire['cover_test_vl_type'],
    cover_test_vl_direction:
      data.cover_vl_direction as VisionBinoculaire['cover_test_vl_direction'],
    cover_test_vp_type:
      data.cover_vp_type as VisionBinoculaire['cover_test_vp_type'],
    cover_test_vp_direction:
      data.cover_vp_direction as VisionBinoculaire['cover_test_vp_direction'],
  };
};

/**
 * Mappe les données API d'examen enfant vers les données de formulaire pour ClinicalCheckChild
 * Inclut les champs conditionnels reflet_pupillaire_detail et fo_detail
 */
export const mapClinicalCheckChildApiToForm = (data: {
  reflet_pupillaire?: string | null;
  reflet_pupillaire_detail?: string | null;
  fo?: string | null;
  fo_detail?: string | null;
}): ClinicalCheckChild | undefined => {
  if (!data) return undefined;
  return {
    reflet_pupillaire:
      data.reflet_pupillaire as ClinicalCheckChild['reflet_pupillaire'],
    reflet_pupillaire_detail: data.reflet_pupillaire_detail ?? null,
    fond_oeil: data.fo as ClinicalCheckChild['fond_oeil'],
    fo_detail: data.fo_detail ?? null,
  };
};

/**
 * Mappe les données API de Medical History vers les données de formulaire
 */
export const mapMedicalHistoryApiToForm = (
  data: MedicalHistoryApi | null | undefined,
): MedicalHistory | undefined => {
  if (!data) return undefined;
  return {
    id: data.id,
    patient: data.patient,
    has_antecedents: data.has_antecedents ?? false,
    has_antecedents_medico_chirurgicaux:
      data.has_antecedents_medico_chirurgicaux ?? false,
    antecedents_medico_chirurgicaux: data.antecedents_medico_chirurgicaux || [],
    has_pathologie_ophtalmologique:
      data.has_pathologie_ophtalmologique ?? false,
    pathologie_ophtalmologique: data.pathologie_ophtalmologique || [],
    familial: (data.familial || []) as MedicalHistory['familial'],
    autre_familial_detail: data.autre_familial_detail ?? null,
    uses_screen: data.uses_screen ?? false,
    screen_time_hours_per_day: data.screen_time_hours_per_day ?? null,
  };
};
