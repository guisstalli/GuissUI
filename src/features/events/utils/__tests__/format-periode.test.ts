/**
 * Tests — libellé de période d'un événement
 *
 * `date_fin` est NULL pour l'immense majorité des événements : c'est la valeur
 * normale de l'historique, pas une donnée manquante. Le libellé d'un événement
 * d'un jour ne doit donc PAS changer.
 */
import { describe, expect, test } from 'vitest';

import {
  estSurPlusieursJours,
  formatPeriodeEvenement,
} from '../format-periode';

describe('formatPeriodeEvenement', () => {
  test('sans date de fin, garde le libellé d une seule journée', () => {
    const libelle = formatPeriodeEvenement(
      '2026-09-14',
      '09:00:00',
      '17:00:00',
    );

    expect(libelle).toContain('09:00');
    expect(libelle).toContain('17:00');
    expect(libelle).not.toMatch(/^du /);
  });

  test('une date de fin IDENTIQUE reste une seule journée', () => {
    // Sans cette garde, « du 14 au 14 » serait une régression de lisibilité.
    const libelle = formatPeriodeEvenement(
      '2026-09-14',
      '09:00:00',
      '17:00:00',
      '2026-09-14',
    );

    expect(libelle).not.toMatch(/^du /);
  });

  test('sur plusieurs jours, montre les DEUX dates', () => {
    const libelle = formatPeriodeEvenement(
      '2026-09-14',
      '14:00:00',
      '09:00:00',
      '2026-09-16',
    );

    expect(libelle).toMatch(/^du /);
    expect(libelle).toContain('14:00');
    expect(libelle).toContain('09:00');
  });

  test('une heure de fin antérieure reste lisible sur plusieurs jours', () => {
    // Lundi 14h → mercredi 9h : légitime, et c'est précisément le cas qui
    // n'aurait aucun sens affiché sans ses dates.
    const libelle = formatPeriodeEvenement(
      '2026-09-14',
      '14:00:00',
      '09:00:00',
      '2026-09-16',
    );

    expect(libelle).toContain('16');
  });
});

describe('estSurPlusieursJours', () => {
  test.each([
    [undefined, false],
    [null, false],
    ['2026-09-14', false],
    ['2026-09-15', true],
  ])('date de fin %s → %s', (dateFin, attendu) => {
    expect(estSurPlusieursJours('2026-09-14', dateFin)).toBe(attendu);
  });
});
