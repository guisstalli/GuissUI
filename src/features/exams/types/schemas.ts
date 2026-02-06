import { z } from 'zod';

// =============================================================================
// COMMON ENUMS - TECHNICAL
// =============================================================================

/** TTT Hypotonisant values - Aligné avec HypotonisantValue Python */
export const TTT_HYPOTONISANT_VALUES = [
  'BBLOQUANTS',
  'IAC',
  'PROSTAGLANDINES',
  'PILOCARPINE',
  'CHIRURGIE',
  'LASER',
  'AUTRES',
] as const;

export const TttHypotonisantEnum = z.enum(TTT_HYPOTONISANT_VALUES);

// =============================================================================
// VISION BINOCULAIRE ENUMS (CHILD ONLY)
// =============================================================================

/** Hirschberg types - Aligné avec HirschbergType Python (minuscules) */
export const HIRSCHBERG_TYPES = [
  'orthotropie',
  'exotropie',
  'esotropie',
] as const;

export const HirschbergTypeEnum = z.enum(HIRSCHBERG_TYPES);

/** Hirschberg detail - Aligné avec HirschbergDetail Python */
export const HIRSCHBERG_DETAIL_VALUES = [
  'bord_pupillaire',
  'iris',
  'limbe',
] as const;

export const HirschbergDetailEnum = z.enum(HIRSCHBERG_DETAIL_VALUES);

/** Stereoscopy Lang II choices - Aligné avec StereoLangIIChoices Python */
export const STEREOSCOPY_LANG_VALUES = [
  'etoile',
  'lune',
  'auto',
  'elephant',
] as const;

export const StereoscopyLangEnum = z.enum(STEREOSCOPY_LANG_VALUES);

/** Pupillary Reflex - Aligné avec PupillaryReflexChoices Python */
export const REFLEX_VALUES = ['rouge', 'leucocorie', 'anormal'] as const;
export const ReflexEnum = z.enum(REFLEX_VALUES);

/** Laterality - Aligné avec LateralityChoices Python (minuscules) */
export const LATERALITY_VALUES = ['od', 'og', 'odg'] as const;
export const LateralityEnum = z.enum(LATERALITY_VALUES);

/** Cover Test types - Aligné avec CoverTypeChoices Python */
export const COVER_TEST_TYPES = ['orthotropie', 'tropie', 'phorie'] as const;

export const CoverTestTypeEnum = z.enum(COVER_TEST_TYPES);

/** Cover Test directions - Aligné avec DirectionChoices Python */
export const COVER_TEST_DIRECTIONS = ['exo', 'eso', 'normale'] as const;
export const CoverTestDirectionEnum = z.enum(COVER_TEST_DIRECTIONS);

/** Clinical check values (child) - minuscules pour API */
export const CLINICAL_CHECK_VALUES = ['normal', 'anormal'] as const;
export const ClinicalCheckEnum = z.enum(CLINICAL_CHECK_VALUES);

// =============================================================================
// CLINICAL ENUMS
// =============================================================================

/** Eye symptoms - Aligné avec Symptomes Python */
export const EYE_SYMPTOMS = [
  'AUCUN',
  'BAV',
  'ROUGEUR',
  'DOULEUR',
  'DIPLOPIE',
  'STRABISME',
  'NYSTAGMUS',
  'PTOSIS',
  'PURIT_OCULAIRE',
  'LARMOIEMENT',
  'SECRETIONS',
  'AUTRES',
] as const;

export const EyeSymptomEnum = z.enum(EYE_SYMPTOMS);

/** Eye options - Aligné avec LateralityChoices (minuscules) */
export const EYE_OPTIONS = ['od', 'og', 'odg'] as const;
export const EyeEnum = z.enum(EYE_OPTIONS);

/** Diplopie types */
export const DIPLOPIE_TYPES = ['monoculaire', 'binoculaire'] as const;
export const DiplopieTypeEnum = z.enum(DIPLOPIE_TYPES);

/** PBO values (Périmétrie) - Aligné avec PerimetrieBinoculaire Python */
export const PBO_VALUES = [
  'NORMAL',
  'SCOTOME_CENTRAL',
  'SCOTOME_PERIPHERIQUE',
  'AMPUTATION',
] as const;

export const PboEnum = z.enum(PBO_VALUES);

/** Segment status - Aligné avec SegmentChoices Python */
export const SEGMENT_STATUS = [
  'NORMAL',
  'PRESENCE_LESION',
  'REMANIEMENT_TOTAL',
] as const;
export const SegmentEnum = z.enum(SEGMENT_STATUS);

/** Cornée values - Aligné avec Cornee Python */
export const CORNEE_VALUES = [
  'NORMAL',
  'OPACITE_AXE',
  'OPACITE_PERIPHERIE',
  'OPACITE_TOTALE',
  'AUTRE',
] as const;
export const CorneeEnum = z.enum(CORNEE_VALUES);

/** Profondeur values - Aligné avec ChambreAnterieureProfondeur Python */
export const PROFONDEUR_VALUES = [
  'NORMALE',
  'REDUITE',
  'AUGMENTEE',
  'ASYMETRIQUE',
] as const;
export const ProfondeurEnum = z.enum(PROFONDEUR_VALUES);

/** Transparence values - Aligné avec ChambreAnterieureTransparence Python */
export const TRANSPARENCE_VALUES = ['NORMAL', 'ANORMALE'] as const;
export const TransparenceEnum = z.enum(TRANSPARENCE_VALUES);

/** Type anomalie values - Aligné avec TypeAnomalie Python */
export const TYPE_ANOMALIE_VALUES = [
  'PIGMENTS',
  'HYPHEMA',
  'HYPOPION',
  'AUTRE',
] as const;
export const TypeAnomalieValueEnum = z.enum(TYPE_ANOMALIE_VALUES);

/** Quantité anomalie values - Aligné avec QuantiteAnomalie Python */
export const QUANTITE_ANOMALIE_VALUES = [
  'MINIME',
  'ATTEIGNANT_AIR_PUPILLAIRE',
  'RECOUVRANT_PUPILLE',
] as const;
export const QuantiteAnomalieEnum = z.enum(QUANTITE_ANOMALIE_VALUES);

/** Pupille values - Aligné avec Pupille Python */
export const PUPILLE_VALUES = ['NORMAL', 'MYOSIS', 'MYDRIASE'] as const;
export const PupilleEnum = z.enum(PUPILLE_VALUES);

/** Axe visuel values - Aligné avec AxeVisuel Python */
export const AXE_VISUEL_VALUES = ['DEGAGE', 'OBSTRUE', 'LEUCOCORIE'] as const;
export const AxeVisuelEnum = z.enum(AXE_VISUEL_VALUES);

/** RPM values - Aligné avec RPM Python */
export const RPM_VALUES = ['NORMAL', 'LENT', 'ABOLI'] as const;
export const RpmEnum = z.enum(RPM_VALUES);

/** Iris values - Aligné avec Iris Python */
export const IRIS_VALUES = [
  'NORMAL',
  'IRIDODONESIS',
  'RUBEOSE',
  'SYNECHIES',
  'AUTRES',
] as const;
export const IrisEnum = z.enum(IRIS_VALUES);

/** Cristallin values - Aligné avec Cristallin Python */
export const CRISTALLIN_VALUES = [
  'NORMAL',
  'OPAQUE',
  'COLOBOME',
  'APHAKIE',
  'PSEUDOPHAKIE',
] as const;
export const CristallinEnum = z.enum(CRISTALLIN_VALUES);

/** Position cristallin values - Aligné avec PositionCristallin Python */
export const POSITION_CRISTALLIN_VALUES = [
  'NORMALE',
  'ECTOPIE',
  'LUXATION_SUBLUXATION_ANTERIEURE',
  'LUXATION_SUBLUXATION_POSTERIEURE',
] as const;
export const PositionCristallinEnum = z.enum(POSITION_CRISTALLIN_VALUES);

/** Vitré values - Aligné avec Vitre Python */
export const VITRE_VALUES = [
  'NORMAL',
  'CORPS_FLOTTANTS',
  'HEMORRAGIE',
  'HYALITE',
  'PVR',
  'AUTRES',
] as const;
export const VitreEnum = z.enum(VITRE_VALUES);

/** Papille values - Aligné avec Papille Python */
export const PAPILLE_VALUES = [
  'NORMALE',
  'EXCAVATION_ELARGIE',
  'ATROPHIE',
  'OEDEME',
  'DYSMORPHIE',
  'AUTRES',
] as const;
export const PapilleEnum = z.enum(PAPILLE_VALUES);

/** Macula values - Aligné avec Macula Python */
export const MACULA_VALUES = ['NORMAL', 'CICATRICE', 'OEDEME', 'DMLA'] as const;
export const MaculaEnum = z.enum(MACULA_VALUES);

/** Rétinien périphérique values - Aligné avec ChampRetinienPeripherique Python */
export const RETINIEN_VALUES = [
  'NORMAL',
  'CICATRICE',
  'OEDEME',
  'HEMORRAGIE',
  'EXUDATS',
  'DEHISCENCE',
  'AUTRE',
] as const;
export const RetinienPeripheriqueEnum = z.enum(RETINIEN_VALUES);

/** Vaisseaux values - Aligné avec Vaisseaux Python */
export const VAISSEAUX_VALUES = [
  'NORMAUX',
  'ARTERIOSCLEROSE',
  'OVR',
  'OAR',
  'NEOVAISSEUX',
] as const;
export const VaissauxEnum = z.enum(VAISSEAUX_VALUES);

/** Vision aptitude (conclusion) - minuscules */
export const VISION_APTITUDE = [
  'compatible',
  'incompatible',
  'a_risque',
] as const;
export const VisionAptitudeEnum = z.enum(VISION_APTITUDE);

/** Sections d'examen (pour mise à jour partielle) */
export const SectionEnum = z.enum([
  'visual_acuity',
  'refraction',
  'ocular_tension',
  'pachymetry',
  'vision_binoculaire',
  'plaintes',
  'biomicro_ant_od',
  'biomicro_ant_og',
  'biomicro_post_od',
  'biomicro_post_og',
  'perimetry',
  'conclusion',
]);

// =============================================================================
// TECHNICAL DATA SCHEMAS
// =============================================================================

/** Acuité Visuelle - Values between 0.000 and 10.000 - All fields optional */
export const VisualAcuitySchema = z.object({
  id: z.number().optional(),
  avsc_od: z.coerce.number().min(0).max(10).optional().nullable(),
  avsc_og: z.coerce.number().min(0).max(10).optional().nullable(),
  avsc_odg: z.coerce.number().min(0).max(10).optional().nullable(),
  avac_od: z.coerce.number().min(0).max(10).optional().nullable(),
  avac_og: z.coerce.number().min(0).max(10).optional().nullable(),
  avac_odg: z.coerce.number().min(0).max(10).optional().nullable(),
  created: z.string().datetime().optional(),
  modified: z.string().datetime().optional(),
});

/** Réfraction - Sphere (-20 to +15), Cylinder (-8 to +8), Axis (0-180) */
export const RefractionSchema = z.object({
  id: z.number().optional(),
  // Per eye OD
  od_sphere: z.coerce.number().min(-20).max(15).optional().nullable(),
  od_cylinder: z.coerce.number().min(-8).max(8).optional().nullable(),
  od_axis: z.coerce.number().min(0).max(180).optional().nullable(),
  od_visual_acuity: z.coerce.number().min(0).max(10).optional().nullable(),
  // Per eye OG
  og_sphere: z.coerce.number().min(-20).max(15).optional().nullable(),
  og_cylinder: z.coerce.number().min(-8).max(8).optional().nullable(),
  og_axis: z.coerce.number().min(0).max(180).optional().nullable(),
  og_visual_acuity: z.coerce.number().min(0).max(10).optional().nullable(),
  // Retinoscopy Standard OD - Focale H, Focale V, Axe H
  retino_od_sphere: z.coerce.number().min(-20).max(15).optional().nullable(), // Focale Horizontale
  retino_od_cylinder: z.coerce.number().min(-8).max(8).optional().nullable(), // Focale Verticale
  retino_od_axis: z.coerce.number().min(0).max(180).optional().nullable(), // Axe Horizontal
  // Retinoscopy Standard OG - Focale H, Focale V, Axe H
  retino_og_sphere: z.coerce.number().min(-20).max(15).optional().nullable(), // Focale Horizontale
  retino_og_cylinder: z.coerce.number().min(-8).max(8).optional().nullable(), // Focale Verticale
  retino_og_axis: z.coerce.number().min(0).max(180).optional().nullable(), // Axe Horizontal
  // Retinoscopy Cycloplegic OD - Focale H, Focale V, Axe H
  cyclo_od_sphere: z.coerce.number().min(-20).max(15).optional().nullable(), // Focale Horizontale
  cyclo_od_cylinder: z.coerce.number().min(-8).max(8).optional().nullable(), // Focale Verticale
  cyclo_od_axis: z.coerce.number().min(0).max(180).optional().nullable(), // Axe Horizontal
  // Retinoscopy Cycloplegic OG - Focale H, Focale V, Axe H
  cyclo_og_sphere: z.coerce.number().min(-20).max(15).optional().nullable(), // Focale Horizontale
  cyclo_og_cylinder: z.coerce.number().min(-8).max(8).optional().nullable(), // Focale Verticale
  cyclo_og_axis: z.coerce.number().min(0).max(180).optional().nullable(), // Axe Horizontal
  // Pupillary Distance
  dp: z.coerce.number().min(40).max(80).optional().nullable(),
  created: z.string().datetime().optional(),
  modified: z.string().datetime().optional(),
});

/** Tension Oculaire - mmHg (0-50) */
export const OcularTensionSchema = z.object({
  id: z.number().optional(),
  od: z.coerce.number().min(0).max(50).optional().nullable(),
  og: z.coerce.number().min(0).max(50).optional().nullable(),
  ttt_hypotonisant: z.boolean().default(false).optional(),
  ttt_hypotonisant_value: z.array(TttHypotonisantEnum).optional().nullable(),
  created: z.string().datetime().optional(),
  modified: z.string().datetime().optional(),
});

/** Pachymétrie (Adult only) - CTO: 300-800 microns */
export const PachymetrySchema = z.object({
  id: z.number().optional(),
  od: z.coerce.number().optional().nullable(),
  og: z.coerce.number().optional().nullable(),
  cto_od: z.coerce.number().min(300).max(800).optional().nullable(),
  cto_og: z.coerce.number().min(300).max(800).optional().nullable(),
  created: z.string().datetime().optional(),
  modified: z.string().datetime().optional(),
});

/** Vision Binoculaire (Child only) - avec validations conditionnelles */
export const VisionBinoculaireSchema = z
  .object({
    id: z.number().optional(),
    // Hirschberg
    hirschberg_type: HirschbergTypeEnum.optional().nullable(),
    hirschberg_detail: HirschbergDetailEnum.optional().nullable(),
    // Stereoscopy (Lang II)
    stereoscopy_lang: StereoscopyLangEnum.optional().nullable(),
    // Pupillary Reflex
    pupillary_reflex: ReflexEnum.optional().nullable(),
    pupillary_reflex_laterality: LateralityEnum.optional().nullable(),
    // Cover Test VL (Vision Loin)
    cover_test_vl_type: CoverTestTypeEnum.optional().nullable(),
    cover_test_vl_direction: CoverTestDirectionEnum.optional().nullable(),
    // Cover Test VP (Vision Près)
    cover_test_vp_type: CoverTestTypeEnum.optional().nullable(),
    cover_test_vp_direction: CoverTestDirectionEnum.optional().nullable(),
    created: z.string().datetime().optional(),
    modified: z.string().datetime().optional(),
  })
  .refine(
    (data) => {
      // hirschberg_detail requis si hirschberg_type !== 'orthotropie'
      if (data.hirschberg_type && data.hirschberg_type !== 'orthotropie') {
        return !!data.hirschberg_detail;
      }
      return true;
    },
    {
      message: "Détail requis si le type n'est pas Orthotropie",
      path: ['hirschberg_detail'],
    },
  )
  .refine(
    (data) => {
      // pupillary_reflex_laterality requis si pupillary_reflex !== 'rouge' (valeur normale)
      if (data.pupillary_reflex && data.pupillary_reflex !== 'rouge') {
        return !!data.pupillary_reflex_laterality;
      }
      return true;
    },
    {
      message: 'Latéralité requise si réflexe anormal',
      path: ['pupillary_reflex_laterality'],
    },
  )
  .refine(
    (data) => {
      // cover_test_vl_direction requis si cover_test_vl_type !== 'orthotropie'
      if (
        data.cover_test_vl_type &&
        data.cover_test_vl_type !== 'orthotropie'
      ) {
        return !!data.cover_test_vl_direction;
      }
      return true;
    },
    {
      message: 'Direction requise si pas Orthotropie',
      path: ['cover_test_vl_direction'],
    },
  )
  .refine(
    (data) => {
      // cover_test_vp_direction requis si cover_test_vp_type !== 'orthotropie'
      if (
        data.cover_test_vp_type &&
        data.cover_test_vp_type !== 'orthotropie'
      ) {
        return !!data.cover_test_vp_direction;
      }
      return true;
    },
    {
      message: 'Direction requise si pas Orthotropie',
      path: ['cover_test_vp_direction'],
    },
  );

/** Clinical Check Child Schema - avec validations conditionnelles */
export const ClinicalCheckChildSchema = z
  .object({
    reflet_pupillaire: ClinicalCheckEnum.optional().nullable(),
    reflet_pupillaire_detail: z.string().max(255).optional().nullable(),
    fond_oeil: ClinicalCheckEnum.optional().nullable(),
    fo_detail: z.string().max(255).optional().nullable(),
  })
  .refine(
    (data) => {
      // reflet_pupillaire_detail requis si reflet_pupillaire === 'anormal'
      if (data.reflet_pupillaire === 'anormal') {
        return (
          data.reflet_pupillaire_detail &&
          data.reflet_pupillaire_detail.trim().length > 0
        );
      }
      return true;
    },
    {
      message: 'Détail requis si le reflet pupillaire est anormal',
      path: ['reflet_pupillaire_detail'],
    },
  )
  .refine(
    (data) => {
      // fo_detail requis si fond_oeil === 'anormal'
      if (data.fond_oeil === 'anormal') {
        return data.fo_detail && data.fo_detail.trim().length > 0;
      }
      return true;
    },
    {
      message: "Détail requis si le fond d'œil est anormal",
      path: ['fo_detail'],
    },
  );

/** Technical Exam complet */
export const TechnicalExamSchema = z.object({
  visualAcuity: VisualAcuitySchema,
  refraction: RefractionSchema,
  ocularTension: OcularTensionSchema,
  pachymetry: PachymetrySchema.optional(),
});

// =============================================================================
// CLINICAL DATA SCHEMAS
// =============================================================================

/** Plaintes - avec validations conditionnelles */
export const PlaintesSchema = z
  .object({
    id: z.number().optional(),
    eye_symptom: z
      .array(EyeSymptomEnum)
      .min(1, 'Veuillez sélectionner au moins un symptôme'),
    autre: z.string().optional().nullable(),
    diplopie: z.boolean().default(false),
    diplopie_type: DiplopieTypeEnum.optional().nullable(),
    strabisme: z.boolean().default(false),
    strabisme_eye: EyeEnum.optional().nullable(),
    nystagmus: z.boolean().default(false),
    nystagmus_eye: EyeEnum.optional().nullable(),
    ptosis: z.boolean().default(false),
    ptosis_eye: EyeEnum.optional().nullable(),
    created: z.string().datetime().optional(),
    modified: z.string().datetime().optional(),
  })
  .refine(
    (data) => {
      if (data.eye_symptom.includes('AUTRES')) {
        return data.autre && data.autre.trim().length > 0;
      }
      return true;
    },
    {
      message: "Veuillez préciser le symptôme dans le champ 'Autre'",
      path: ['autre'],
    },
  )
  .refine(
    (data) => {
      if (data.diplopie) {
        return !!data.diplopie_type;
      }
      return true;
    },
    {
      message: 'Veuillez préciser le type de diplopie',
      path: ['diplopie_type'],
    },
  )
  .refine(
    (data) => {
      if (data.strabisme) {
        return !!data.strabisme_eye;
      }
      return true;
    },
    {
      message: "Veuillez préciser l'œil concerné",
      path: ['strabisme_eye'],
    },
  )
  .refine(
    (data) => {
      if (data.nystagmus) {
        return !!data.nystagmus_eye;
      }
      return true;
    },
    {
      message: "Veuillez préciser l'œil concerné",
      path: ['nystagmus_eye'],
    },
  )
  .refine(
    (data) => {
      if (data.ptosis) {
        return !!data.ptosis_eye;
      }
      return true;
    },
    {
      message: "Veuillez préciser l'œil concerné",
      path: ['ptosis_eye'],
    },
  );

/** Périmétrie */
export const PerimetrySchema = z.object({
  id: z.number().optional(),
  pbo: z.array(PboEnum).min(1, 'Veuillez sélectionner au moins un élément'),
  limite_superieure: z.coerce.number().min(0).max(90).optional().nullable(),
  limite_inferieure: z.coerce.number().min(0).max(90).optional().nullable(),
  limite_temporale_droit: z.coerce
    .number()
    .min(0)
    .max(120)
    .optional()
    .nullable(),
  limite_temporale_gauche: z.coerce
    .number()
    .min(0)
    .max(120)
    .optional()
    .nullable(),
  etendue_horizontal: z.coerce.number().min(0).max(180).optional().nullable(),
  score_esternmen: z.coerce.number().min(0).max(100).optional().nullable(),
  image: z.any().optional().nullable(),
  images: z.any().optional().nullable(),
  created: z.string().datetime().optional(),
  modified: z.string().datetime().optional(),
});

/** Biomicroscopie Segment Antérieur - avec validations conditionnelles */
export const BiomicroscopyAnteriorSchema = z
  .object({
    id: z.number().optional(),
    segment: SegmentEnum,
    cornee: CorneeEnum.optional().nullable(),
    cornee_autre: z.string().optional().nullable(),
    profondeur: ProfondeurEnum.optional().nullable(),
    transparence: TransparenceEnum.optional().nullable(),
    type_anomalie_value: TypeAnomalieValueEnum.optional().nullable(),
    type_anomalie_autre: z.string().optional().nullable(),
    quantite_anomalie: QuantiteAnomalieEnum.optional().nullable(),
    pupille: PupilleEnum.optional().nullable(),
    axe_visuel: AxeVisuelEnum.optional().nullable(),
    rpm: RpmEnum.optional().nullable(),
    iris: IrisEnum.optional().nullable(),
    iris_autres: z.string().optional().nullable(),
    cristallin: CristallinEnum.optional().nullable(),
    position_cristallin: PositionCristallinEnum.optional().nullable(),
    created: z.string().datetime().optional(),
    modified: z.string().datetime().optional(),
  })
  .refine(
    (data) => {
      if (data.cornee === 'AUTRE') {
        return data.cornee_autre && data.cornee_autre.trim().length > 0;
      }
      return true;
    },
    {
      message: "Veuillez préciser la cornée dans le champ 'Autre'",
      path: ['cornee_autre'],
    },
  )
  .refine(
    (data) => {
      if (data.iris === 'AUTRES') {
        return data.iris_autres && data.iris_autres.trim().length > 0;
      }
      return true;
    },
    {
      message: "Veuillez préciser l'iris dans le champ 'Autre'",
      path: ['iris_autres'],
    },
  )
  .refine(
    (data) => {
      if (data.type_anomalie_value === 'AUTRE') {
        return (
          data.type_anomalie_autre && data.type_anomalie_autre.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Veuillez préciser le type d'anomalie dans le champ 'Autre'",
      path: ['type_anomalie_autre'],
    },
  );

/** Biomicroscopie Segment Postérieur - avec validations conditionnelles */
export const BiomicroscopyPosteriorSchema = z
  .object({
    id: z.number().optional(),
    segment: SegmentEnum,
    vitre: VitreEnum.optional().nullable(),
    vitre_autres: z.string().optional().nullable(),
    papille: PapilleEnum.optional().nullable(),
    papille_autres: z.string().optional().nullable(),
    macula: MaculaEnum.optional().nullable(),
    retinien_peripherique: RetinienPeripheriqueEnum.optional().nullable(),
    retinien_peripherique_autre: z.string().optional().nullable(),
    vaissaux: VaissauxEnum.optional().nullable(),
    cd: z.coerce.number().min(0).max(1).optional().nullable(),
    observation: z.string().optional().nullable(),
    created: z.string().datetime().optional(),
    modified: z.string().datetime().optional(),
  })
  .refine(
    (data) => {
      if (data.vitre === 'AUTRES') {
        return data.vitre_autres && data.vitre_autres.trim().length > 0;
      }
      return true;
    },
    {
      message: "Veuillez préciser le vitré dans le champ 'Autre'",
      path: ['vitre_autres'],
    },
  )
  .refine(
    (data) => {
      if (data.papille === 'AUTRES') {
        return data.papille_autres && data.papille_autres.trim().length > 0;
      }
      return true;
    },
    {
      message: "Veuillez préciser la papille dans le champ 'Autre'",
      path: ['papille_autres'],
    },
  )
  .refine(
    (data) => {
      if (data.retinien_peripherique === 'AUTRE') {
        return (
          data.retinien_peripherique_autre &&
          data.retinien_peripherique_autre.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Veuillez préciser le champ rétinien dans le champ 'Autre'",
      path: ['retinien_peripherique_autre'],
    },
  );

/** Images BpSup */
export const BpSupSchema = z.object({
  retinographie: z.any().optional().nullable(),
  oct: z.any().optional().nullable(),
  autres: z.any().optional().nullable(),
});

/** Conclusion */
export const ConclusionSchema = z.object({
  id: z.number().optional(),
  vision: VisionAptitudeEnum.optional().nullable(),
  cat: z.string().optional().nullable(),
  traitement: z.string().optional().nullable(),
  observation: z.string().optional().nullable(),
  //rv: z.boolean().default(false),
  //  date_prochain_rendez_vous: z.string().optional().nullable(),
  diagnostic_cim_11: z.array(z.string().max(100)).max(10).optional().nullable(),
  created: z.string().datetime().optional(),
  modified: z.string().datetime().optional(),
});

/** Clinical Exam complet */
export const ClinicalExamSchema = z.object({
  plaintes: PlaintesSchema,
  perimetry: PerimetrySchema.optional(),
  bp_sup: BpSupSchema.optional(),
  od: z.object({
    bp_sg_anterieur: BiomicroscopyAnteriorSchema,
    bp_sg_posterieur: BiomicroscopyPosteriorSchema,
  }),
  og: z.object({
    bp_sg_anterieur: BiomicroscopyAnteriorSchema,
    bp_sg_posterieur: BiomicroscopyPosteriorSchema,
  }),
  conclusion: ConclusionSchema,
});

// =============================================================================
// EXAMEN ADULTE SCHEMAS
// =============================================================================

/** Examen adulte (format liste) */
export const ExamenAdultSchema = z.object({
  id: z.number(),
  numero_examen: z.string(),
  patient: z.number(),
  patient_name: z.string(),
  is_completed: z.boolean(),
  created: z.string().datetime(),
  modified: z.string().datetime(),
});

/** Examen adulte création */
export const ExamenAdultCreateSchema = z.object({
  patient_id: z.number(),
});

/** Patient nested schema */
export const PatientNestedSchema = z.object({
  id: z.number(),
  numero_identifiant: z.string(),
  last_name: z.string(),
  name: z.string(),
  full_name: z.string(),
  date_de_naissance: z.string(),
  age: z.number(),
  sex: z.enum(['H', 'F', 'A']),
  is_adult: z.boolean(),
  phone_number: z.string().nullable().optional(),
  created: z.string().datetime(),
});

/** Examen adulte détail */
export const ExamenAdultDetailSchema = z.object({
  id: z.number(),
  numero_examen: z.string(),
  patient: PatientNestedSchema,
  technical_examen: TechnicalExamSchema.nullable().optional(),
  clinical_examen: ClinicalExamSchema.nullable().optional(),
  is_completed: z.boolean(),
  completion_status: z.record(z.unknown()).optional(),
  created: z.string().datetime(),
  modified: z.string().datetime(),
});

/** Mise à jour progressive (section) */
export const ExamenAdultProgressiveSchema = z.object({
  section: SectionEnum,
  data: z.record(z.unknown()),
});

/** Finalisation examen */
export const ExamenAdultCompleteSchema = z.object({
  technical_data: z.record(z.unknown()).optional(),
  clinical_data: z.record(z.unknown()).optional(),
  mark_completed: z.boolean().default(true),
});

/** Réponse paginée examens adulte */
export const PaginatedExamenAdultListSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(ExamenAdultSchema),
});

// =============================================================================
// EXAMEN ENFANT SCHEMAS
// =============================================================================

/** Examen enfant (format liste) */
export const ExamenChildSchema = z.object({
  id: z.number(),
  numero_examen: z.string(),
  patient: z.number(),
  patient_name: z.string(),
  reflet_pupillaire: ClinicalCheckEnum.optional().nullable(),
  reflet_pupillaire_detail: z.string().max(255).optional().nullable(),
  fo: ClinicalCheckEnum.optional().nullable(),
  fo_detail: z.string().max(255).optional().nullable(),
  created: z.string().datetime(),
  modified: z.string().datetime(),
});

/** Examen enfant création - avec validations conditionnelles */
export const ExamenChildCreateSchema = z
  .object({
    patient_id: z.number(),
    reflet_pupillaire: ClinicalCheckEnum.optional().nullable(),
    reflet_pupillaire_detail: z.string().max(255).optional().nullable(),
    fo: ClinicalCheckEnum.optional().nullable(),
    fo_detail: z.string().max(255).optional().nullable(),
    technical_data: TechnicalExamSchema.optional(),
    clinical_data: ClinicalExamSchema.optional(),
  })
  .refine(
    (data) => {
      // reflet_pupillaire_detail requis si reflet_pupillaire === 'anormal'
      if (data.reflet_pupillaire === 'anormal') {
        return (
          data.reflet_pupillaire_detail &&
          data.reflet_pupillaire_detail.trim().length > 0
        );
      }
      return true;
    },
    {
      message: 'Détail requis si le reflet pupillaire est anormal',
      path: ['reflet_pupillaire_detail'],
    },
  )
  .refine(
    (data) => {
      // fo_detail requis si fo === 'anormal'
      if (data.fo === 'anormal') {
        return data.fo_detail && data.fo_detail.trim().length > 0;
      }
      return true;
    },
    {
      message: "Détail requis si le fond d'œil est anormal",
      path: ['fo_detail'],
    },
  );

/** Examen enfant détail */
export const ExamenChildDetailSchema = z.object({
  id: z.number(),
  numero_examen: z.string(),
  patient: PatientNestedSchema,
  reflet_pupillaire: ClinicalCheckEnum.nullable(),
  reflet_pupillaire_detail: z.string().max(255).optional().nullable(),
  fo: ClinicalCheckEnum.nullable(),
  fo_detail: z.string().max(255).optional().nullable(),
  visual_acuity: VisualAcuitySchema.nullable(),
  ocular_tension: OcularTensionSchema.nullable(),
  refraction: RefractionSchema.nullable(),
  vision_binoculaire: VisionBinoculaireSchema.nullable(),
  created: z.string().datetime(),
  modified: z.string().datetime(),
});

/** Réponse paginée examens enfant */
export const PaginatedExamenChildListSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(ExamenChildSchema),
});

// =============================================================================
// PIÈCES JOINTES SCHEMAS
// =============================================================================

/** Pièce jointe (format liste) */
export const ExamenSupplementaireListSchema = z.object({
  id: z.number(),
  original_filename: z.string(),
  file_type: z.string(),
  file_size: z.number(),
  description: z.string().nullable().optional(),
  is_image: z.boolean(),
  is_pdf: z.boolean(),
  created: z.string().datetime(),
});

/** Pièce jointe (format détail) */
export const ExamenSupplementaireSchema = z.object({
  id: z.number(),
  clinical_examen: z.number(),
  file_url: z.string().nullable(),
  file_type: z.string(),
  original_filename: z.string(),
  file_size: z.number(),
  description: z.string().nullable().optional(),
  is_image: z.boolean(),
  is_pdf: z.boolean(),
  uploaded_by_keycloak_id: z.string().nullable(),
  created: z.string().datetime(),
  modified: z.string().datetime(),
});

/** Création pièce jointe */
export const ExamenSupplementaireCreateSchema = z.object({
  file: z.string(),
  description: z.string().max(500).optional(),
});

/** Réponse paginée pièces jointes */
export const PaginatedExamenSupplementaireListSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(ExamenSupplementaireListSchema),
});

// =============================================================================
// DEFAULT VALUES
// =============================================================================

export const defaultBiomicroscopyAnterior: BiomicroscopyAnteriorFormValues = {
  segment: 'NORMAL',
  cornee: null,
  cornee_autre: null,
  profondeur: null,
  transparence: null,
  type_anomalie_value: null,
  type_anomalie_autre: null,
  quantite_anomalie: null,
  pupille: null,
  axe_visuel: null,
  rpm: null,
  iris: null,
  iris_autres: null,
  cristallin: null,
  position_cristallin: null,
};

export const defaultBiomicroscopyPosterior: BiomicroscopyPosteriorFormValues = {
  segment: 'NORMAL',
  vitre: null,
  vitre_autres: null,
  papille: null,
  papille_autres: null,
  macula: null,
  retinien_peripherique: null,
  retinien_peripherique_autre: null,
  vaissaux: null,
  cd: null,
  observation: null,
};

// =============================================================================
// TYPES EXPORTÉS - TECHNICAL
// =============================================================================

export type VisualAcuityFormValues = z.infer<typeof VisualAcuitySchema>;
export type RefractionFormValues = z.infer<typeof RefractionSchema>;
export type OcularTensionFormValues = z.infer<typeof OcularTensionSchema>;
export type PachymetryFormValues = z.infer<typeof PachymetrySchema>;
export type TechnicalExamFormValues = z.infer<typeof TechnicalExamSchema>;

// =============================================================================
// TYPES EXPORTÉS - CLINICAL ADULT
// =============================================================================

export type PlaintesFormValues = z.infer<typeof PlaintesSchema>;
export type PerimetryFormValues = z.infer<typeof PerimetrySchema>;
export type BiomicroscopyAnteriorFormValues = z.infer<
  typeof BiomicroscopyAnteriorSchema
>;
export type BiomicroscopyPosteriorFormValues = z.infer<
  typeof BiomicroscopyPosteriorSchema
>;
export type ConclusionFormValues = z.infer<typeof ConclusionSchema>;
export type ClinicalExamFormValues = z.infer<typeof ClinicalExamSchema>;

// =============================================================================
// TYPES EXPORTÉS - CHILD SPECIFIC
// =============================================================================

export type VisionBinoculaireFormValues = z.infer<
  typeof VisionBinoculaireSchema
>;
export type ClinicalCheckChildFormValues = z.infer<
  typeof ClinicalCheckChildSchema
>;

// =============================================================================
// TYPES EXPORTÉS - EXAMEN
// =============================================================================

export type ExamenAdult = z.infer<typeof ExamenAdultSchema>;
export type ExamenAdultCreate = z.infer<typeof ExamenAdultCreateSchema>;
export type ExamenAdultDetail = z.infer<typeof ExamenAdultDetailSchema>;
export type ExamenAdultProgressive = z.infer<
  typeof ExamenAdultProgressiveSchema
>;
export type ExamenAdultComplete = z.infer<typeof ExamenAdultCompleteSchema>;
export type PaginatedExamenAdultList = z.infer<
  typeof PaginatedExamenAdultListSchema
>;

export type ExamenChild = z.infer<typeof ExamenChildSchema>;
export type ExamenChildCreate = z.infer<typeof ExamenChildCreateSchema>;
export type ExamenChildDetail = z.infer<typeof ExamenChildDetailSchema>;
export type PaginatedExamenChildList = z.infer<
  typeof PaginatedExamenChildListSchema
>;

// =============================================================================
// TYPES EXPORTÉS - PIÈCES JOINTES
// =============================================================================

export type ExamenSupplementaireList = z.infer<
  typeof ExamenSupplementaireListSchema
>;
export type ExamenSupplementaire = z.infer<typeof ExamenSupplementaireSchema>;
export type ExamenSupplementaireCreate = z.infer<
  typeof ExamenSupplementaireCreateSchema
>;
export type PaginatedExamenSupplementaireList = z.infer<
  typeof PaginatedExamenSupplementaireListSchema
>;
