import { describe, expect, test, vi } from 'vitest';

import { CarteAnomalie } from '@/features/qualite/components/carte-anomalie';
import { rtlRender, screen, userEvent } from '@/testing/test-utils';

import type { RegleQualite } from '../../types/types';

const regle = (partiel: Partial<RegleQualite> = {}): RegleQualite => ({
  code: 'doublons',
  famille: 'examens',
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

/**
 * L'import du 26/06/2026 a repris 410 conducteurs de l'ancienne plateforme.
 * Six ont une date de naissance qui en fait des enfants de 0 à 7 ans. Sans
 * cette ventilation, la carte afficherait « 6 » sans dire que ces six-là ne
 * se corrigent pas comme une faute de frappe de la semaine dernière.
 */
describe('Provenance des anomalies de dossier', () => {
  test('affiche la part héritée de l’ancienne plateforme', () => {
    rtlRender(
      <CarteAnomalie
        regle={regle({
          code: 'conducteur_trop_jeune',
          famille: 'dossiers',
          libelle: 'Conducteur de moins de 16 ans',
          nombre: 6,
          importes: 6,
          saisis: 0,
        })}
      />,
    );

    expect(
      screen.getByText(/héritée\(s\) de l’ancienne plateforme/),
    ).toBeVisible();
  });

  test('ne dit rien quand tout a été saisi dans l’application', () => {
    rtlRender(
      <CarteAnomalie
        regle={regle({
          code: 'permis_perime',
          famille: 'dossiers',
          nombre: 8,
          importes: 0,
          saisis: 8,
        })}
      />,
    );

    // Une mention « dont 0 héritée » serait du bruit sur chaque carte saine.
    expect(screen.queryByText(/ancienne plateforme/)).not.toBeInTheDocument();
  });
});
