import { describe, expect, test } from 'vitest';

import { PREFIXE_ANCRE, lierCitations, numeroDeCitation } from '../citations';

describe('lierCitations', () => {
  test('transforme un marqueur en lien vers sa carte source', () => {
    expect(lierCitations('4069 [1] patients.')).toBe(
      `4069 [1](${PREFIXE_ANCRE}1) patients.`,
    );
  });

  test('chaque marqueur pointe sur sa propre carte', () => {
    const texte = lierCitations('4069 [1] patients, 512 [2] conducteurs.');

    expect(texte).toContain(`[1](${PREFIXE_ANCRE}1)`);
    expect(texte).toContain(`[2](${PREFIXE_ANCRE}2)`);
  });

  test('ne touche pas au contenu des blocs de code', () => {
    const original = 'Requête :\n\n```sql\nSELECT arr [1];\n```\n';

    expect(lierCitations(original)).toBe(original);
  });

  test('ne touche pas au code en ligne', () => {
    expect(lierCitations('Le champ `valeurs [1]` est indexé.')).toBe(
      'Le champ `valeurs [1]` est indexé.',
    );
  });

  test('laisse intact un texte sans marqueur', () => {
    expect(lierCitations('Aucun chiffre ici.')).toBe('Aucun chiffre ici.');
  });

  test('tolère un contenu vide', () => {
    expect(lierCitations('')).toBe('');
  });
});

describe('numeroDeCitation', () => {
  test('extrait le numéro de source', () => {
    expect(numeroDeCitation(`${PREFIXE_ANCRE}3`)).toBe(3);
  });

  test('ignore un lien ordinaire', () => {
    expect(numeroDeCitation('https://exemple.sn')).toBeNull();
    expect(numeroDeCitation('#autre-ancre')).toBeNull();
    expect(numeroDeCitation(undefined)).toBeNull();
  });
});
