import { describe, expect, test, vi } from 'vitest';

import { CarteAnomalie } from '@/features/qualite/components/carte-anomalie';
import { rtlRender, screen, userEvent } from '@/testing/test-utils';

import type { RegleQualite } from '../../types/types';

const regle = (partiel: Partial<RegleQualite> = {}): RegleQualite => ({
  code: 'doublons',
  libelle: 'Plusieurs examens pour un patient le même jour',
  gravite: 'critique',
  explication: 'Les données cliniques se dispersent entre les doublons.',
  nombre: 15,
  ...partiel,
});

/**
 * Le compte seul ne dit rien : « 15 » n'alarme personne. C'est l'explication
 * qui fait comprendre pourquoi il faut agir le jour même — et c'est ce que
 * ces tests protègent.
 */
describe('Carte d’anomalie', () => {
  test('affiche le nombre et ce qu il implique', () => {
    rtlRender(<CarteAnomalie regle={regle()} />);

    expect(screen.getByText('15')).toBeVisible();
    expect(screen.getByText(/se dispersent entre les doublons/)).toBeVisible();
  });

  test('une règle saine ne crie pas', () => {
    rtlRender(<CarteAnomalie regle={regle({ nombre: 0 })} />);

    expect(screen.getByText('0')).toBeVisible();
    // Sans ce basculement, l'écran resterait rouge en permanence et on
    // cesserait de le lire.
    expect(screen.getByText('Aucune anomalie détectée.')).toBeVisible();
    expect(screen.queryByText(/se dispersent/)).not.toBeInTheDocument();
  });

  test('une règle saine n’est pas cliquable', async () => {
    const ouvrir = vi.fn();
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    rtlRender(<CarteAnomalie regle={regle({ nombre: 0 })} onOuvrir={ouvrir} />);

    await user.click(screen.getByRole('button'));

    expect(ouvrir).not.toHaveBeenCalled();
  });

  test('une anomalie réelle ouvre son détail', async () => {
    const ouvrir = vi.fn();
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    rtlRender(<CarteAnomalie regle={regle()} onOuvrir={ouvrir} />);

    await user.click(screen.getByRole('button'));

    expect(ouvrir).toHaveBeenCalledWith('doublons');
  });
});
