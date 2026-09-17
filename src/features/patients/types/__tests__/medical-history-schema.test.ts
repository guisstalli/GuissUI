import { describe, expect, it } from 'vitest';

import { medicalHistorySchema } from '../medical-history-schema';

/**
 * Audit des champs conditionnels (17/09/2026). Le serveur
 * (apps/depistage/models/patient.py, Antecedents.clean) exige quatre
 * précisions dès que la case correspondante est cochée. Le formulaire ne les
 * exigeait pas : l'enregistrement partait et revenait en 400.
 */
const base = {
  has_antecedents: true,
  has_antecedents_medico_chirurgicaux: false,
  antecedents_medico_chirurgicaux: [],
  has_pathologie_ophtalmologique: false,
  pathologie_ophtalmologique: [],
  familial: [],
  autre_familial_detail: null,
  uses_screen: false,
  screen_time_hours_per_day: null,
  addiction: false,
  type_addiction: [],
  autre_addiction_detail: null,
  tabagisme_detail: null,
};

const champsEnErreur = (data: unknown) => {
  const r = medicalHistorySchema.safeParse(data);
  return r.success ? [] : r.error.issues.map((i) => String(i.path[0]));
};

describe('medicalHistorySchema — précisions exigées par le serveur', () => {
  it('sans antécédent déclaré, rien n’est exigé', () => {
    expect(
      medicalHistorySchema.safeParse({ ...base, has_antecedents: false })
        .success,
    ).toBe(true);
  });

  it('antécédents médico-chirurgicaux cochés : la liste est exigée', () => {
    expect(
      champsEnErreur({ ...base, has_antecedents_medico_chirurgicaux: true }),
    ).toContain('antecedents_medico_chirurgicaux');
  });

  it('pathologie ophtalmologique cochée : la liste est exigée', () => {
    expect(
      champsEnErreur({ ...base, has_pathologie_ophtalmologique: true }),
    ).toContain('pathologie_ophtalmologique');
  });

  it('usage d’écran déclaré : le nombre d’heures est exigé', () => {
    expect(champsEnErreur({ ...base, uses_screen: true })).toContain(
      'screen_time_hours_per_day',
    );
  });

  it('addiction déclarée : le type est exigé', () => {
    expect(champsEnErreur({ ...base, addiction: true })).toContain(
      'type_addiction',
    );
  });

  it('addiction « autres » : le détail est exigé', () => {
    expect(
      champsEnErreur({
        ...base,
        addiction: true,
        type_addiction: ['AUTRES'],
      }),
    ).toContain('autre_addiction_detail');
  });

  it('tout renseigné : le formulaire passe', () => {
    expect(
      medicalHistorySchema.safeParse({
        ...base,
        has_antecedents_medico_chirurgicaux: true,
        antecedents_medico_chirurgicaux: ['Diabète'],
        has_pathologie_ophtalmologique: true,
        pathologie_ophtalmologique: ['Glaucome'],
        familial: ['OTHER'],
        autre_familial_detail: 'Oncle myope fort',
        uses_screen: true,
        screen_time_hours_per_day: 6,
        addiction: true,
        type_addiction: ['AUTRES'],
        autre_addiction_detail: 'Kola',
      }).success,
    ).toBe(true);
  });

  it('antécédent familial « autre » : la précision reste exigée', () => {
    expect(champsEnErreur({ ...base, familial: ['OTHER'] })).toContain(
      'autre_familial_detail',
    );
  });
});
