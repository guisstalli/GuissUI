/**
 * Tests — schémas de validation conducteur
 *
 * Le formulaire était couvert sur son RENDU (treize cas), pas sur ses RÈGLES.
 * Or c'est là que se logent les surprises : un formulaire qui affiche bien
 * mais accepte une donnée invalide laisse passer le problème jusqu'en base.
 *
 * On éprouve le schéma directement plutôt que par le DOM : chaque branche est
 * atteignable, y compris les bornes qu'un test d'interface ne sait pas viser.
 */
import { describe, expect, test } from 'vitest';

import {
  DriverCreateSchema,
  DriverUpdateSchema,
  NIVEAU_INSTRUCTION_VALUES,
  REGIONS,
  SERVICE_VALUES,
  TYPE_PERMIS_VALUES,
  VEHICULE_VALUES,
} from '../schemas';

const BASE = {
  patient: {
    name: 'Ibrahima',
    last_name: 'Fall',
    date_de_naissance: '1985-06-10',
    sex: 'H' as const,
    phone_number: '',
  },
  numero_permis: 'SN-12345',
  type_permis: 'Leger' as const,
  autre_type_permis: '',
  date_delivrance_permis: '2010-01-01',
  date_peremption_permis: '2030-01-01',
  transporteur_professionnel: false,
  service: 'Prive' as const,
  annees_experience: 10,
  type_vehicule_conduit: 'Leger' as const,
  type_instruction_suivie: 'Française' as const,
  niveau_instruction: 'Secondaire' as const,
  prise_en_charge: null,
  zone_de_residence: 'Dakar' as const,
};

/** Chemin d'erreur → message, pour assertions lisibles. */
const erreurs = (resultat: { success: boolean; error?: unknown }) => {
  if (resultat.success) return {};
  const zod = resultat.error as {
    issues: { path: (string | number)[]; message: string }[];
  };
  return Object.fromEntries(
    zod.issues.map((i) => [i.path.join('.'), i.message]),
  );
};

// ─── Cas nominal ──────────────────────────────────────────────────────────────

describe('DriverCreateSchema — cas nominal', () => {
  test('accepte un dossier complet et valide', () => {
    expect(DriverCreateSchema.safeParse(BASE).success).toBe(true);
  });
});

// ─── Type de permis « Autres » ────────────────────────────────────────────────

describe('type_permis = Autres', () => {
  test('exige une précision', () => {
    const r = DriverCreateSchema.safeParse({ ...BASE, type_permis: 'Autres' });
    expect(r.success).toBe(false);
    expect(erreurs(r)['autre_type_permis']).toMatch(/préciser/i);
  });

  test('rejette une précision faite uniquement d espaces', () => {
    // `.trim()` dans la règle : sans lui, « respecter le champ » se réduirait
    // à taper une espace.
    const r = DriverCreateSchema.safeParse({
      ...BASE,
      type_permis: 'Autres',
      autre_type_permis: '   ',
    });
    expect(r.success).toBe(false);
  });

  test('accepte une précision renseignée', () => {
    const r = DriverCreateSchema.safeParse({
      ...BASE,
      type_permis: 'Autres',
      autre_type_permis: 'Permis moto',
    });
    expect(r.success).toBe(true);
  });

  test('n exige rien quand le type n est pas Autres', () => {
    const r = DriverCreateSchema.safeParse({
      ...BASE,
      type_permis: 'Lourd',
      autre_type_permis: '',
    });
    expect(r.success).toBe(true);
  });
});

// ─── Cohérence des dates de permis ────────────────────────────────────────────

describe('dates de permis', () => {
  test('rejette une péremption antérieure à la délivrance', () => {
    const r = DriverCreateSchema.safeParse({
      ...BASE,
      date_delivrance_permis: '2020-01-01',
      date_peremption_permis: '2015-01-01',
    });
    expect(r.success).toBe(false);
    expect(erreurs(r)['date_peremption_permis']).toMatch(/postérieure/i);
  });

  test('rejette deux dates IDENTIQUES', () => {
    // Borne : la règle est `<=`. Un permis périmé le jour de sa délivrance
    // n'a pas de sens, et un test « antérieure » seul laisserait passer ce cas.
    const r = DriverCreateSchema.safeParse({
      ...BASE,
      date_delivrance_permis: '2020-01-01',
      date_peremption_permis: '2020-01-01',
    });
    expect(r.success).toBe(false);
  });

  test('accepte un jour d écart', () => {
    const r = DriverCreateSchema.safeParse({
      ...BASE,
      date_delivrance_permis: '2020-01-01',
      date_peremption_permis: '2020-01-02',
    });
    expect(r.success).toBe(true);
  });

  test('une date manquante est signalée comme requise, pas comme incohérente', () => {
    const r = DriverCreateSchema.safeParse({
      ...BASE,
      date_peremption_permis: '',
    });
    expect(r.success).toBe(false);
    expect(erreurs(r)['date_peremption_permis']).toMatch(/requise/i);
  });
});

// ─── Champs obligatoires ──────────────────────────────────────────────────────

describe('champs obligatoires', () => {
  test('numéro de permis vide est refusé', () => {
    const r = DriverCreateSchema.safeParse({ ...BASE, numero_permis: '' });
    expect(r.success).toBe(false);
    expect(erreurs(r)['numero_permis']).toMatch(/requis/i);
  });

  test.each([
    ['name', 'prénom'],
    ['last_name', 'nom'],
    ['date_de_naissance', 'date de naissance'],
  ])('patient.%s vide est refusé', (champ) => {
    const r = DriverCreateSchema.safeParse({
      ...BASE,
      patient: { ...BASE.patient, [champ]: '' },
    });
    expect(r.success).toBe(false);
  });

  test('téléphone vide est ACCEPTÉ — le champ est optionnel', () => {
    const r = DriverCreateSchema.safeParse({
      ...BASE,
      patient: { ...BASE.patient, phone_number: '' },
    });
    expect(r.success).toBe(true);
  });
});

// ─── Valeurs d'énumération ────────────────────────────────────────────────────

describe('énumérations', () => {
  test.each(TYPE_PERMIS_VALUES)('type_permis « %s » est accepté', (v) => {
    const extra = v === 'Autres' ? { autre_type_permis: 'Moto' } : {};
    expect(
      DriverCreateSchema.safeParse({ ...BASE, type_permis: v, ...extra })
        .success,
    ).toBe(true);
  });

  test.each(SERVICE_VALUES)('service « %s » est accepté', (v) => {
    expect(DriverCreateSchema.safeParse({ ...BASE, service: v }).success).toBe(
      true,
    );
  });

  test.each(VEHICULE_VALUES)(
    'type_vehicule_conduit « %s » est accepté',
    (v) => {
      expect(
        DriverCreateSchema.safeParse({ ...BASE, type_vehicule_conduit: v })
          .success,
      ).toBe(true);
    },
  );

  test.each(NIVEAU_INSTRUCTION_VALUES)(
    'niveau_instruction « %s » est accepté',
    (v) => {
      expect(
        DriverCreateSchema.safeParse({ ...BASE, niveau_instruction: v })
          .success,
      ).toBe(true);
    },
  );

  test('les 14 régions du Sénégal sont acceptées', () => {
    const refusees = REGIONS.filter(
      (r) =>
        !DriverCreateSchema.safeParse({ ...BASE, zone_de_residence: r })
          .success,
    );
    expect(refusees).toEqual([]);
  });

  test('une valeur hors énumération est refusée', () => {
    expect(
      DriverCreateSchema.safeParse({ ...BASE, service: 'Militaire' }).success,
    ).toBe(false);
    expect(
      DriverCreateSchema.safeParse({ ...BASE, zone_de_residence: 'Paris' })
        .success,
    ).toBe(false);
  });
});

// ─── Années d'expérience ──────────────────────────────────────────────────────

describe('annees_experience', () => {
  test('zéro est accepté — un conducteur peut débuter', () => {
    expect(
      DriverCreateSchema.safeParse({ ...BASE, annees_experience: 0 }).success,
    ).toBe(true);
  });

  test('une valeur négative est refusée', () => {
    expect(
      DriverCreateSchema.safeParse({ ...BASE, annees_experience: -1 }).success,
    ).toBe(false);
  });

  test('une chaîne numérique est convertie (z.coerce)', () => {
    // Un <input type="number"> rend une CHAÎNE : sans la coercition, toute
    // saisie serait refusée.
    const r = DriverCreateSchema.safeParse({ ...BASE, annees_experience: '7' });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.annees_experience).toBe(7);
  });
});

// ─── Schéma de mise à jour ────────────────────────────────────────────────────

describe('DriverUpdateSchema', () => {
  test('accepte une modification partielle', () => {
    expect(DriverUpdateSchema.safeParse({ service: 'Public' }).success).toBe(
      true,
    );
  });

  test('accepte un objet vide — aucune modification', () => {
    expect(DriverUpdateSchema.safeParse({}).success).toBe(true);
  });

  test('applique la même règle sur type_permis = Autres', () => {
    const r = DriverUpdateSchema.safeParse({ type_permis: 'Autres' });
    expect(r.success).toBe(false);
    expect(erreurs(r)['autre_type_permis']).toMatch(/préciser/i);
  });

  test('n exige pas le patient — il n est jamais modifié ici', () => {
    expect(
      DriverUpdateSchema.safeParse({ numero_permis: 'SN-999' }).success,
    ).toBe(true);
  });
});
