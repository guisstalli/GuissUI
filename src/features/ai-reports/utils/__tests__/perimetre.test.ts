import { describe, expect, test } from 'vitest';

import {
  entreesDuPerimetre,
  restrictionsNonTransmises,
  resumePerimetre,
} from '../perimetre';

describe('entreesDuPerimetre', () => {
  test('décrit en français ce qui part au serveur', () => {
    const entrees = entreesDuPerimetre({
      date_start: '2026-01-01',
      sex: 'F',
      exam_type: 'adult',
    });

    expect(entrees).toEqual([
      { label: 'Depuis le', valeur: '2026-01-01' },
      { label: 'Sexe', valeur: 'Femmes' },
      { label: "Type d'examen", valeur: 'Adulte' },
    ]);
  });

  test('nomme les sites plutôt que leurs identifiants', () => {
    const entrees = entreesDuPerimetre(
      { site_id: [9, 12] },
      new Map([
        [9, 'Centre Dakar'],
        [12, 'Thiès Nord'],
      ]),
    );

    expect(entrees[0]).toEqual({
      label: 'Sites',
      valeur: 'Centre Dakar, Thiès Nord',
    });
  });

  test('une valeur neutre ne compte pas comme une restriction', () => {
    expect(entreesDuPerimetre({ exam_type: 'all', age_band: 'all' })).toEqual(
      [],
    );
  });

  test('annonce la cohorte par son effectif, pas par ses identifiants', () => {
    // Les identifiants n'apprendraient rien au lecteur, et le serveur ne les
    // montre pas davantage — il les injecte après l'appel du modèle.
    expect(entreesDuPerimetre({ patient_ids: [1, 2, 3] })).toEqual([
      { label: 'Cohorte', valeur: '3 patients sélectionnés' },
    ]);
  });

  test('un seul patient se lit au singulier', () => {
    expect(entreesDuPerimetre({ patient_ids: [7] })[0].valeur).toBe(
      '1 patient sélectionné',
    );
  });

  test("ignore une dimension qu'aucun outil n'accepte", () => {
    // Le filtre posé en cliquant un segment reste propre à l'écran :
    // l'annoncer promettrait un filtre que le serveur n'applique pas.
    expect(entreesDuPerimetre({ acuity: 'basse' })).toEqual([]);
  });
});

describe('restrictionsNonTransmises', () => {
  test("nomme un filtre de clic, que l'assistant ne peut pas appliquer", () => {
    expect(restrictionsNonTransmises({ acuity: 'basse' })).toEqual([
      "le filtre d'acuité",
    ]);
  });

  test('la cohorte ne compte plus parmi les restrictions perdues', () => {
    expect(restrictionsNonTransmises({ patient_ids: [1, 2] })).toEqual([]);
  });

  test('ne signale rien quand rien ne manque', () => {
    expect(restrictionsNonTransmises({ date_start: '2026-01-01' })).toEqual([]);
  });
});

describe('resumePerimetre', () => {
  test('sans filtre, dit que tout est couvert', () => {
    expect(resumePerimetre([])).toBe('Toutes les données');
  });

  test('énumère les restrictions actives', () => {
    expect(
      resumePerimetre([
        { label: 'Sexe', valeur: 'Femmes' },
        { label: 'Sites', valeur: 'Centre Dakar' },
      ]),
    ).toBe('Sexe Femmes · Sites Centre Dakar');
  });
});
