/**
 * Tests — inscription publique à un événement conducteurs
 *
 * `driver_data` est optionnel sur le schéma de base et devient OBLIGATOIRE
 * quand l'événement est « pour conducteurs ». Cette bascule est le cœur du
 * correctif : sans elle, l'inscription repartait sans la moindre donnée
 * conducteur et la personne devenait un patient adulte ordinaire.
 */
import { describe, expect, test } from 'vitest';

import {
  DriverEssentialsSchema,
  inscriptionPubliqueSchemaFor,
} from '../schemas';

const INSCRIT = {
  nom: 'Fall',
  prenom: 'Ibrahima',
  phone_number: '',
  date_de_naissance: '1985-06-10',
  sex: 'H' as const,
};

const CONDUCTEUR = {
  numero_permis: 'SN-12345',
  type_permis: 'Leger' as const,
  service: 'Prive' as const,
  zone_de_residence: 'Dakar',
};

describe('événement ORDINAIRE', () => {
  test('accepte une inscription sans donnée conducteur', () => {
    expect(inscriptionPubliqueSchemaFor(false).safeParse(INSCRIT).success).toBe(
      true,
    );
  });

  test('tolère des données conducteur fournies malgré tout', () => {
    const r = inscriptionPubliqueSchemaFor(false).safeParse({
      ...INSCRIT,
      driver_data: CONDUCTEUR,
    });
    expect(r.success).toBe(true);
  });
});

describe('événement CONDUCTEURS', () => {
  const schema = inscriptionPubliqueSchemaFor(true);

  test('RÉGRESSION : refuse une inscription sans donnée conducteur', () => {
    // Le défaut d'origine : le formulaire partait sans rien, et l'inscrit
    // devenait un patient adulte ordinaire.
    expect(schema.safeParse(INSCRIT).success).toBe(false);
  });

  test('accepte une inscription complète', () => {
    expect(
      schema.safeParse({ ...INSCRIT, driver_data: CONDUCTEUR }).success,
    ).toBe(true);
  });

  test.each(['numero_permis', 'type_permis', 'service', 'zone_de_residence'])(
    'refuse une inscription dont %s manque',
    (champ) => {
      const partiel = { ...CONDUCTEUR } as Record<string, unknown>;
      delete partiel[champ];
      expect(
        schema.safeParse({ ...INSCRIT, driver_data: partiel }).success,
      ).toBe(false);
    },
  );

  test("l'état civil reste exigé même sur un événement conducteurs", () => {
    expect(
      schema.safeParse({ ...INSCRIT, nom: '', driver_data: CONDUCTEUR })
        .success,
    ).toBe(false);
  });

  test('le téléphone demeure facultatif', () => {
    expect(
      schema.safeParse({
        ...INSCRIT,
        phone_number: '',
        driver_data: CONDUCTEUR,
      }).success,
    ).toBe(true);
  });
});

describe('DriverEssentialsSchema — bornes', () => {
  test('un numéro de permis vide est refusé', () => {
    expect(
      DriverEssentialsSchema.safeParse({ ...CONDUCTEUR, numero_permis: '' })
        .success,
    ).toBe(false);
  });

  test('une valeur hors énumération est refusée', () => {
    expect(
      DriverEssentialsSchema.safeParse({ ...CONDUCTEUR, service: 'Militaire' })
        .success,
    ).toBe(false);
    expect(
      DriverEssentialsSchema.safeParse({ ...CONDUCTEUR, type_permis: 'Moto' })
        .success,
    ).toBe(false);
  });

  test.each(['Leger', 'Lourd', 'Autres'])(
    'type de permis « %s » est accepté',
    (v) => {
      expect(
        DriverEssentialsSchema.safeParse({ ...CONDUCTEUR, type_permis: v })
          .success,
      ).toBe(true);
    },
  );
});
