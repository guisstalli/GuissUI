import { describe, expect, test } from 'vitest';

import type { RegleSaisie } from '@/features/regles-saisie/api/get-regles';
import { TableRegles } from '@/features/regles-saisie/components/table-regles';
import { rtlRender, screen } from '@/testing/test-utils';

const regle = (partiel: Partial<RegleSaisie> = {}): RegleSaisie => ({
  code: 'reflet_pupillaire_lateralite',
  domaine: 'Examen enfant',
  champ: 'vision_binoculaire.reflet_lateralite',
  regle: 'La latéralité n’est exigée que si le reflet est anormal.',
  statut: 'validee',
  source: 'Pre Aïssatou Magatte Wane',
  date_validation: '2026-09-18',
  incident: '102 enregistrements refusés le 17/09/2026.',
  applique_dans: 'apps/depistage/models/clinical_components.py',
  ...partiel,
});

/**
 * L'écran existe pour répondre à une seule question : d'où vient cette règle ?
 * Les deux réponses possibles — une personne nommée, ou personne — doivent être
 * lisibles sans ambiguïté.
 */
describe('Table des règles de saisie', () => {
  test('une règle validée nomme sa source et sa date', () => {
    rtlRender(<TableRegles regles={[regle()]} />);

    expect(
      screen.getByText(/Pre Aïssatou Magatte Wane — 2026-09-18/),
    ).toBeVisible();
    expect(screen.getByText('Validée')).toBeVisible();
  });

  test('une règle sans source le dit franchement', () => {
    rtlRender(
      <TableRegles
        regles={[
          regle({
            code: 'seuils_aptitude_conducteur',
            statut: 'a_valider',
            source: '',
            date_validation: '',
          }),
        ]}
      />,
    );

    expect(screen.getByText('À valider')).toBeVisible();
    expect(
      screen.getByText(
        /Aucune source clinique\s*: cette règle décide aujourd’hui/,
      ),
    ).toBeVisible();
  });
});
