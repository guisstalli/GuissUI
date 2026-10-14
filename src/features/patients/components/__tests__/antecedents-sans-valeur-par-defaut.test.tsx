import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { estReponseAucun } from '@/components/ui/icd-selector/est-reponse-aucun';
import { rtlRender, screen } from '@/testing/test-utils';

import { FAMILIAL_LABELS } from '../../types/schemas';
import { ReponseTroisEtats } from '../reponse-trois-etats';

// Lot 4 du plan : antécédents sans valeur par défaut (C25, C27).

describe('C25 — « a des antécédents » sans réponse par défaut', () => {
  test('rien n’est coché quand la réponse est « non renseigné »', () => {
    rtlRender(<ReponseTroisEtats value={null} onChange={vi.fn()} />);
    expect(screen.getByRole('radio', { name: 'Oui' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Non' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Non renseigné' })).toBeChecked();
  });

  test('« Non » renvoie false, et non null', async () => {
    const onChange = vi.fn();
    rtlRender(<ReponseTroisEtats value={null} onChange={onChange} />);
    await userEvent.click(screen.getByRole('radio', { name: 'Non' }));
    expect(onChange).toHaveBeenCalledWith(false);
  });
});

describe('C27 — antécédents à la saisie', () => {
  test('les réponses « Aucun… » de la nomenclature sont écartées', () => {
    expect(
      estReponseAucun('AUCUN obstacle (aucun, absence, négligeable, ...) 0-4%'),
    ).toBe(true);
    expect(estReponseAucun('Aucune déficience visuelle')).toBe(true);
    expect(estReponseAucun('Glaucome primitif à angle ouvert')).toBe(false);
  });

  test('antécédents familiaux en cases à cocher', () => {
    expect(Object.values(FAMILIAL_LABELS)).toEqual(
      expect.arrayContaining([
        'Amétropie',
        'Diabète',
        'HTA',
        'Asthme',
        'Drépanocytose',
      ]),
    );
  });
});
