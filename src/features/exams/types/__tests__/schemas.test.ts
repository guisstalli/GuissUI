import { describe, it, expect } from 'vitest';

import {
  VisualAcuitySchema,
  RefractionSchema,
  VisionBinoculaireSchema,
  ClinicalCheckChildSchema,
  PlaintesSchema,
  BiomicroscopyAnteriorSchema,
  BiomicroscopyPosteriorSchema,
} from '../schemas';

// =============================================================================
// VISUAL ACUITY SCHEMA
// =============================================================================

describe('VisualAcuitySchema', () => {
  const baseValid = {
    correction: false,
    avsc_od: 1.0,
    avsc_og: 0.8,
    avsc_odg: 0.9,
  };

  const allCorrectionFields = {
    avac_od_prescrite: 1.0,
    avac_og_prescrite: 0.8,
    avac_odg_prescrite: 0.9,
  };

  it('passe avec des données valides sans correction', () => {
    // Arrange
    const data = baseValid;

    // Act
    const result = VisualAcuitySchema.safeParse(data);

    // Assert
    expect(result.success).toBe(true);
  });

  it('passe avec correction=true et tous les champs avec correction renseignés', () => {
    // Arrange
    const data = { ...baseValid, correction: true, ...allCorrectionFields };

    // Act
    const result = VisualAcuitySchema.safeParse(data);

    // Assert
    expect(result.success).toBe(true);
  });

  describe('correction conditionnelle', () => {
    it('échoue si correction=true et avac_od_prescrite absent', () => {
      // Arrange
      const data = {
        ...baseValid,
        correction: true,
        ...allCorrectionFields,
        avac_od_prescrite: null,
      };

      // Act
      const result = VisualAcuitySchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('avac_od_prescrite');
      }
    });

    it('échoue si correction=true et avac_odg_prescrite absent', () => {
      // Arrange
      const data = {
        ...baseValid,
        correction: true,
        ...allCorrectionFields,
        avac_odg_prescrite: null,
      };

      // Act
      const result = VisualAcuitySchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('avac_odg_prescrite');
      }
    });

    it('échoue si correction=true et les 6 champs sont manquants — produit 6 erreurs', () => {
      // Arrange
      const data = { ...baseValid, correction: true };

      // Act
      const result = VisualAcuitySchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(3);
      }
    });

    it('passe si correction=false et les champs avec correction sont absents', () => {
      // Arrange
      const data = { ...baseValid, correction: false };

      // Act
      const result = VisualAcuitySchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    it('passe si correction non défini et les champs avec correction sont absents', () => {
      // Arrange
      const data = { avsc_od: 1.0 };

      // Act
      const result = VisualAcuitySchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });
});

// =============================================================================
// REFRACTION SCHEMA
// =============================================================================

describe('RefractionSchema', () => {
  const allCorrectionFields = {
    od_sphere_avec_correction: 1.0,
    od_cylinder_avec_correction: -0.5,
    od_axis_avec_correction: 90,
    og_sphere_avec_correction: 0.75,
    og_cylinder_avec_correction: -0.25,
    og_axis_avec_correction: 45,
    od_visual_acuity_avec_correction: 1.0,
    og_visual_acuity_avec_correction: 0.9,
    odg_visual_acuity_avec_correction: 1.0,
  };

  it('passe avec des données valides sans correction', () => {
    // Arrange
    const data = { correction: false, od_sphere: 1.0, og_sphere: -0.5 };

    // Act
    const result = RefractionSchema.safeParse(data);

    // Assert
    expect(result.success).toBe(true);
  });

  it('passe avec correction=true et tous les 9 champs avec correction renseignés', () => {
    // Arrange
    const data = { correction: true, ...allCorrectionFields };

    // Act
    const result = RefractionSchema.safeParse(data);

    // Assert
    expect(result.success).toBe(true);
  });

  describe('correction conditionnelle', () => {
    it('échoue si correction=true et od_sphere_avec_correction absent', () => {
      // Arrange
      const data = {
        correction: true,
        ...allCorrectionFields,
        od_sphere_avec_correction: null,
      };

      // Act
      const result = RefractionSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('od_sphere_avec_correction');
      }
    });

    it('échoue si correction=true et odg_visual_acuity_avec_correction absent', () => {
      // Arrange
      const data = {
        correction: true,
        ...allCorrectionFields,
        odg_visual_acuity_avec_correction: null,
      };

      // Act
      const result = RefractionSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('odg_visual_acuity_avec_correction');
      }
    });

    it('échoue si correction=true et les 9 champs sont manquants — produit 9 erreurs', () => {
      // Arrange
      const data = { correction: true };

      // Act
      const result = RefractionSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues).toHaveLength(9);
      }
    });

    it('passe si correction=false et les champs avec correction sont absents', () => {
      // Arrange
      const data = { correction: false };

      // Act
      const result = RefractionSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });
});

// =============================================================================
// VISION BINOCULAIRE SCHEMA
// =============================================================================

describe('VisionBinoculaireSchema', () => {
  it('passe avec des données valides minimales', () => {
    // Arrange
    const data = {};

    // Act
    const result = VisionBinoculaireSchema.safeParse(data);

    // Assert
    expect(result.success).toBe(true);
  });

  it('passe avec toutes les données valides renseignées', () => {
    // Arrange
    const data = {
      hirschberg_type: 'esotropie',
      hirschberg_detail: 'iris',
      pupillary_reflex: 'leucocorie',
      pupillary_reflex_laterality: 'od',
      cover_test_vl_type: 'tropie',
      cover_test_vl_direction: 'eso',
      cover_test_vp_type: 'phorie',
      cover_test_vp_direction: 'exo',
    };

    // Act
    const result = VisionBinoculaireSchema.safeParse(data);

    // Assert
    expect(result.success).toBe(true);
  });

  describe('hirschberg_detail conditionnel', () => {
    it('échoue si hirschberg_type=esotropie et hirschberg_detail absent', () => {
      // Arrange
      const data = { hirschberg_type: 'esotropie', hirschberg_detail: null };

      // Act
      const result = VisionBinoculaireSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('hirschberg_detail');
      }
    });

    it('échoue si hirschberg_type=exotropie et hirschberg_detail absent', () => {
      // Arrange
      const data = { hirschberg_type: 'exotropie', hirschberg_detail: null };

      // Act
      const result = VisionBinoculaireSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
    });

    it('passe si hirschberg_type=esotropie et hirschberg_detail renseigné', () => {
      // Arrange
      const data = {
        hirschberg_type: 'esotropie',
        hirschberg_detail: 'bord_pupillaire',
      };

      // Act
      const result = VisionBinoculaireSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    it('passe si hirschberg_type=orthotropie et hirschberg_detail absent (cas normal)', () => {
      // Arrange
      const data = { hirschberg_type: 'orthotropie', hirschberg_detail: null };

      // Act
      const result = VisionBinoculaireSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    it('passe si hirschberg_type absent et hirschberg_detail absent', () => {
      // Arrange
      const data = { hirschberg_type: null, hirschberg_detail: null };

      // Act
      const result = VisionBinoculaireSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('pupillary_reflex_laterality conditionnel', () => {
    it('échoue si pupillary_reflex=leucocorie et pupillary_reflex_laterality absent', () => {
      // Arrange
      const data = {
        pupillary_reflex: 'leucocorie',
        pupillary_reflex_laterality: null,
      };

      // Act
      const result = VisionBinoculaireSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('pupillary_reflex_laterality');
      }
    });

    it('échoue si pupillary_reflex=anormal et pupillary_reflex_laterality absent', () => {
      // Arrange
      const data = {
        pupillary_reflex: 'anormal',
        pupillary_reflex_laterality: null,
      };

      // Act
      const result = VisionBinoculaireSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
    });

    it('passe si pupillary_reflex=leucocorie et pupillary_reflex_laterality renseigné', () => {
      // Arrange
      const data = {
        pupillary_reflex: 'leucocorie',
        pupillary_reflex_laterality: 'og',
      };

      // Act
      const result = VisionBinoculaireSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    it('passe si pupillary_reflex=rouge et pupillary_reflex_laterality absent (valeur normale)', () => {
      // Arrange
      const data = {
        pupillary_reflex: 'rouge',
        pupillary_reflex_laterality: null,
      };

      // Act
      const result = VisionBinoculaireSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('cover_test_vl_direction conditionnel', () => {
    it('échoue si cover_test_vl_type=tropie et cover_test_vl_direction absent', () => {
      // Arrange
      const data = {
        cover_test_vl_type: 'tropie',
        cover_test_vl_direction: null,
      };

      // Act
      const result = VisionBinoculaireSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('cover_test_vl_direction');
      }
    });

    it('passe si cover_test_vl_type=tropie et cover_test_vl_direction renseigné', () => {
      // Arrange
      const data = {
        cover_test_vl_type: 'tropie',
        cover_test_vl_direction: 'eso',
      };

      // Act
      const result = VisionBinoculaireSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    it('passe si cover_test_vl_type=orthotropie et cover_test_vl_direction absent', () => {
      // Arrange
      const data = {
        cover_test_vl_type: 'orthotropie',
        cover_test_vl_direction: null,
      };

      // Act
      const result = VisionBinoculaireSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('cover_test_vp_direction conditionnel', () => {
    it('échoue si cover_test_vp_type=phorie et cover_test_vp_direction absent', () => {
      // Arrange
      const data = {
        cover_test_vp_type: 'phorie',
        cover_test_vp_direction: null,
      };

      // Act
      const result = VisionBinoculaireSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('cover_test_vp_direction');
      }
    });

    it('passe si cover_test_vp_type=phorie et cover_test_vp_direction renseigné', () => {
      // Arrange
      const data = {
        cover_test_vp_type: 'phorie',
        cover_test_vp_direction: 'exo',
      };

      // Act
      const result = VisionBinoculaireSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    it('passe si cover_test_vp_type=orthotropie et cover_test_vp_direction absent', () => {
      // Arrange
      const data = {
        cover_test_vp_type: 'orthotropie',
        cover_test_vp_direction: null,
      };

      // Act
      const result = VisionBinoculaireSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });
});

// =============================================================================
// CLINICAL CHECK CHILD SCHEMA
// =============================================================================

describe('ClinicalCheckChildSchema', () => {
  it('passe avec des données valides minimales', () => {
    // Arrange
    const data = {};

    // Act
    const result = ClinicalCheckChildSchema.safeParse(data);

    // Assert
    expect(result.success).toBe(true);
  });

  it('passe avec reflet_pupillaire=normal sans détail', () => {
    // Arrange
    const data = {
      reflet_pupillaire: 'normal',
      reflet_pupillaire_detail: null,
    };

    // Act
    const result = ClinicalCheckChildSchema.safeParse(data);

    // Assert
    expect(result.success).toBe(true);
  });

  describe('reflet_pupillaire_detail conditionnel', () => {
    it('échoue si reflet_pupillaire=anormal et reflet_pupillaire_detail absent', () => {
      // Arrange
      const data = {
        reflet_pupillaire: 'anormal',
        reflet_pupillaire_detail: null,
      };

      // Act
      const result = ClinicalCheckChildSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('reflet_pupillaire_detail');
      }
    });

    it('échoue si reflet_pupillaire=anormal et reflet_pupillaire_detail est une chaîne vide', () => {
      // Arrange
      const data = {
        reflet_pupillaire: 'anormal',
        reflet_pupillaire_detail: '   ',
      };

      // Act
      const result = ClinicalCheckChildSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
    });

    it('passe si reflet_pupillaire=anormal et reflet_pupillaire_detail renseigné', () => {
      // Arrange
      const data = {
        reflet_pupillaire: 'anormal',
        reflet_pupillaire_detail: 'Leucocorie bilatérale',
      };

      // Act
      const result = ClinicalCheckChildSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    it('passe si reflet_pupillaire=normal et reflet_pupillaire_detail absent', () => {
      // Arrange
      const data = {
        reflet_pupillaire: 'normal',
        reflet_pupillaire_detail: null,
      };

      // Act
      const result = ClinicalCheckChildSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('fo_detail conditionnel', () => {
    it('échoue si fond_oeil=anormal et fo_detail absent', () => {
      // Arrange
      const data = { fond_oeil: 'anormal', fo_detail: null };

      // Act
      const result = ClinicalCheckChildSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('fo_detail');
      }
    });

    it('passe si fond_oeil=anormal et fo_detail renseigné', () => {
      // Arrange
      const data = { fond_oeil: 'anormal', fo_detail: 'Anomalie détectée' };

      // Act
      const result = ClinicalCheckChildSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    it('passe si fond_oeil=normal et fo_detail absent', () => {
      // Arrange
      const data = { fond_oeil: 'normal', fo_detail: null };

      // Act
      const result = ClinicalCheckChildSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });
});

// =============================================================================
// PLAINTES SCHEMA
// =============================================================================

describe('PlaintesSchema', () => {
  const baseValid = {
    eye_symptom: ['BAV'],
    diplopie: false,
    strabisme: false,
    nystagmus: false,
    ptosis: false,
  };

  it('passe avec des données valides minimales', () => {
    // Arrange
    const data = baseValid;

    // Act
    const result = PlaintesSchema.safeParse(data);

    // Assert
    expect(result.success).toBe(true);
  });

  it('échoue si eye_symptom est vide', () => {
    // Arrange
    const data = { ...baseValid, eye_symptom: [] };

    // Act
    const result = PlaintesSchema.safeParse(data);

    // Assert
    expect(result.success).toBe(false);
  });

  describe('autre conditionnel (eye_symptom contient AUTRES)', () => {
    it('échoue si eye_symptom inclut AUTRES et autre absent', () => {
      // Arrange
      const data = {
        ...baseValid,
        eye_symptom: ['BAV', 'AUTRES'],
        autre: null,
      };

      // Act
      const result = PlaintesSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('autre');
      }
    });

    it('passe si eye_symptom inclut AUTRES et autre renseigné', () => {
      // Arrange
      const data = {
        ...baseValid,
        eye_symptom: ['BAV', 'AUTRES'],
        autre: 'Symptôme spécifique',
      };

      // Act
      const result = PlaintesSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    it("passe si eye_symptom n'inclut pas AUTRES et autre absent", () => {
      // Arrange
      const data = { ...baseValid, autre: null };

      // Act
      const result = PlaintesSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('diplopie_type conditionnel', () => {
    it('échoue si diplopie=true et diplopie_type absent', () => {
      // Arrange
      const data = { ...baseValid, diplopie: true, diplopie_type: null };

      // Act
      const result = PlaintesSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('diplopie_type');
      }
    });

    it('passe si diplopie=true et diplopie_type renseigné', () => {
      // Arrange
      const data = {
        ...baseValid,
        diplopie: true,
        diplopie_type: 'monoculaire',
      };

      // Act
      const result = PlaintesSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    it('passe si diplopie=false et diplopie_type absent', () => {
      // Arrange
      const data = { ...baseValid, diplopie: false, diplopie_type: null };

      // Act
      const result = PlaintesSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('strabisme conditionnel', () => {
    it('échoue si strabisme=true et strabisme_type absent', () => {
      // Arrange
      const data = {
        ...baseValid,
        strabisme: true,
        strabisme_type: null,
        strabisme_eye: null,
      };

      // Act
      const result = PlaintesSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('strabisme_type');
      }
    });

    it('échoue si strabisme=true et strabisme_type présent mais strabisme_eye absent', () => {
      // Arrange
      const data = {
        ...baseValid,
        strabisme: true,
        strabisme_type: 'convergent',
        strabisme_eye: null,
      };

      // Act
      const result = PlaintesSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
    });

    it('passe si strabisme=true avec strabisme_type et strabisme_eye renseignés', () => {
      // Arrange
      const data = {
        ...baseValid,
        strabisme: true,
        strabisme_type: 'convergent',
        strabisme_eye: 'od',
      };

      // Act
      const result = PlaintesSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    it('passe si strabisme=false et strabisme_type absent', () => {
      // Arrange
      const data = {
        ...baseValid,
        strabisme: false,
        strabisme_type: null,
        strabisme_eye: null,
      };

      // Act
      const result = PlaintesSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('nystagmus_eye conditionnel', () => {
    it('échoue si nystagmus=true et nystagmus_eye absent', () => {
      // Arrange
      const data = { ...baseValid, nystagmus: true, nystagmus_eye: null };

      // Act
      const result = PlaintesSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('nystagmus_eye');
      }
    });

    it('passe si nystagmus=true et nystagmus_eye renseigné', () => {
      // Arrange
      const data = { ...baseValid, nystagmus: true, nystagmus_eye: 'odg' };

      // Act
      const result = PlaintesSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    it('passe si nystagmus=false et nystagmus_eye absent', () => {
      // Arrange
      const data = { ...baseValid, nystagmus: false, nystagmus_eye: null };

      // Act
      const result = PlaintesSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('ptosis_eye conditionnel', () => {
    it('échoue si ptosis=true et ptosis_eye absent', () => {
      // Arrange
      const data = { ...baseValid, ptosis: true, ptosis_eye: null };

      // Act
      const result = PlaintesSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('ptosis_eye');
      }
    });

    it('passe si ptosis=true et ptosis_eye renseigné', () => {
      // Arrange
      const data = { ...baseValid, ptosis: true, ptosis_eye: 'og' };

      // Act
      const result = PlaintesSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    it('passe si ptosis=false et ptosis_eye absent', () => {
      // Arrange
      const data = { ...baseValid, ptosis: false, ptosis_eye: null };

      // Act
      const result = PlaintesSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });
});

// =============================================================================
// BIOMICROSCOPY ANTERIOR SCHEMA
// =============================================================================

describe('BiomicroscopyAnteriorSchema', () => {
  const baseValid = { segment: 'NORMAL' as const };

  it('passe avec segment=NORMAL', () => {
    // Arrange
    const data = baseValid;

    // Act
    const result = BiomicroscopyAnteriorSchema.safeParse(data);

    // Assert
    expect(result.success).toBe(true);
  });

  it('passe avec segment=PRESENCE_LESION et tous les champs optionnels absents', () => {
    // Arrange
    const data = { segment: 'PRESENCE_LESION' as const };

    // Act
    const result = BiomicroscopyAnteriorSchema.safeParse(data);

    // Assert
    expect(result.success).toBe(true);
  });

  describe('cornee_autre conditionnel', () => {
    it('échoue si cornee=AUTRE et cornee_autre absent', () => {
      // Arrange
      const data = {
        ...baseValid,
        cornee: 'AUTRE' as const,
        cornee_autre: null,
      };

      // Act
      const result = BiomicroscopyAnteriorSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('cornee_autre');
      }
    });

    it('passe si cornee=AUTRE et cornee_autre renseigné', () => {
      // Arrange
      const data = {
        ...baseValid,
        cornee: 'AUTRE' as const,
        cornee_autre: 'Description spécifique',
      };

      // Act
      const result = BiomicroscopyAnteriorSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    it('passe si cornee=NORMAL et cornee_autre absent', () => {
      // Arrange
      const data = {
        ...baseValid,
        cornee: 'NORMAL' as const,
        cornee_autre: null,
      };

      // Act
      const result = BiomicroscopyAnteriorSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('iris_autres conditionnel', () => {
    it('échoue si iris=AUTRES et iris_autres absent', () => {
      // Arrange
      const data = {
        ...baseValid,
        iris: 'AUTRES' as const,
        iris_autres: null,
      };

      // Act
      const result = BiomicroscopyAnteriorSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('iris_autres');
      }
    });

    it('passe si iris=AUTRES et iris_autres renseigné', () => {
      // Arrange
      const data = {
        ...baseValid,
        iris: 'AUTRES' as const,
        iris_autres: 'Anomalie iris',
      };

      // Act
      const result = BiomicroscopyAnteriorSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    it('passe si iris=NORMAL et iris_autres absent', () => {
      // Arrange
      const data = {
        ...baseValid,
        iris: 'NORMAL' as const,
        iris_autres: null,
      };

      // Act
      const result = BiomicroscopyAnteriorSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('type_anomalie_autre conditionnel', () => {
    it('échoue si type_anomalie_value=AUTRE et type_anomalie_autre absent', () => {
      // Arrange
      const data = {
        ...baseValid,
        type_anomalie_value: 'AUTRE' as const,
        type_anomalie_autre: null,
      };

      // Act
      const result = BiomicroscopyAnteriorSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('type_anomalie_autre');
      }
    });

    it('passe si type_anomalie_value=AUTRE et type_anomalie_autre renseigné', () => {
      // Arrange
      const data = {
        ...baseValid,
        type_anomalie_value: 'AUTRE' as const,
        type_anomalie_autre: 'Type spécifique',
      };

      // Act
      const result = BiomicroscopyAnteriorSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    it('passe si type_anomalie_value=PIGMENTS et type_anomalie_autre absent', () => {
      // Arrange
      const data = {
        ...baseValid,
        type_anomalie_value: 'PIGMENTS' as const,
        type_anomalie_autre: null,
      };

      // Act
      const result = BiomicroscopyAnteriorSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });
});

// =============================================================================
// BIOMICROSCOPY POSTERIOR SCHEMA
// =============================================================================

describe('BiomicroscopyPosteriorSchema', () => {
  const baseValid = { segment: 'NORMAL' as const };

  it('passe avec segment=NORMAL', () => {
    // Arrange
    const data = baseValid;

    // Act
    const result = BiomicroscopyPosteriorSchema.safeParse(data);

    // Assert
    expect(result.success).toBe(true);
  });

  describe('vitre_autres conditionnel', () => {
    it('échoue si vitre=AUTRES et vitre_autres absent', () => {
      // Arrange
      const data = {
        ...baseValid,
        vitre: 'AUTRES' as const,
        vitre_autres: null,
      };

      // Act
      const result = BiomicroscopyPosteriorSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('vitre_autres');
      }
    });

    it('passe si vitre=AUTRES et vitre_autres renseigné', () => {
      // Arrange
      const data = {
        ...baseValid,
        vitre: 'AUTRES' as const,
        vitre_autres: 'Anomalie vitré',
      };

      // Act
      const result = BiomicroscopyPosteriorSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    it('passe si vitre=NORMAL et vitre_autres absent', () => {
      // Arrange
      const data = {
        ...baseValid,
        vitre: 'NORMAL' as const,
        vitre_autres: null,
      };

      // Act
      const result = BiomicroscopyPosteriorSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('papille_autres conditionnel', () => {
    it('échoue si papille=AUTRES et papille_autres absent', () => {
      // Arrange
      const data = {
        ...baseValid,
        papille: 'AUTRES' as const,
        papille_autres: null,
      };

      // Act
      const result = BiomicroscopyPosteriorSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('papille_autres');
      }
    });

    it('passe si papille=AUTRES et papille_autres renseigné', () => {
      // Arrange
      const data = {
        ...baseValid,
        papille: 'AUTRES' as const,
        papille_autres: 'Anomalie papille',
      };

      // Act
      const result = BiomicroscopyPosteriorSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    it('passe si papille=NORMALE et papille_autres absent', () => {
      // Arrange
      const data = {
        ...baseValid,
        papille: 'NORMALE' as const,
        papille_autres: null,
      };

      // Act
      const result = BiomicroscopyPosteriorSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });

  describe('retine_peripherique_autre conditionnel', () => {
    it('échoue si retine_peripherique=AUTRE et retine_peripherique_autre absent', () => {
      // Arrange
      const data = {
        ...baseValid,
        retine_peripherique: 'AUTRE' as const,
        retine_peripherique_autre: null,
      };

      // Act
      const result = BiomicroscopyPosteriorSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(false);
      if (!result.success) {
        const paths = result.error.issues.map((i) => i.path[0]);
        expect(paths).toContain('retine_peripherique_autre');
      }
    });

    it('passe si retine_peripherique=AUTRE et retine_peripherique_autre renseigné', () => {
      // Arrange
      const data = {
        ...baseValid,
        retine_peripherique: 'AUTRE' as const,
        retine_peripherique_autre: 'Anomalie rétinienne',
      };

      // Act
      const result = BiomicroscopyPosteriorSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });

    it('passe si retine_peripherique=NORMAL et retine_peripherique_autre absent', () => {
      // Arrange
      const data = {
        ...baseValid,
        retine_peripherique: 'NORMAL' as const,
        retine_peripherique_autre: null,
      };

      // Act
      const result = BiomicroscopyPosteriorSchema.safeParse(data);

      // Assert
      expect(result.success).toBe(true);
    });
  });
});
