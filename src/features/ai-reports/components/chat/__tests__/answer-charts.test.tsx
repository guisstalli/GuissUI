import { describe, expect, test } from 'vitest';

import { rtlRender, screen } from '@/testing/test-utils';

import type { SourceDisplay } from '../../../types';
import { AnswerCharts } from '../answer-charts';

/**
 * L'assistant citait ses répartitions en prose, à charge pour le lecteur de les
 * reconstruire mentalement. Les valeurs existaient pourtant déjà, agrégées et
 * passées par la suppression des petits effectifs.
 */
const source = (distributions: SourceDisplay['distributions']): SourceDisplay =>
  ({
    tool: 'get_refraction',
    label: 'Réfraction (équivalent sphérique)',
    filters: [],
    cell_count: 120,
    distributions,
  }) as SourceDisplay;

describe('Répartitions de la réponse', () => {
  test('sans distribution, aucun graphique n’est rendu', () => {
    const { container } = rtlRender(<AnswerCharts sources={[source([])]} />);

    expect(container).toBeEmptyDOMElement();
  });

  test('une réponse sans sources ne rend rien', () => {
    const { container } = rtlRender(<AnswerCharts sources={null} />);

    expect(container).toBeEmptyDOMElement();
  });

  test('la répartition est titrée en français et rattachée à sa source', () => {
    rtlRender(
      <AnswerCharts
        sources={[
          source([
            {
              cle: 'distribution_pct',
              valeurs: [{ label: 'Hypermétropie', valeur: 52.7 }],
            },
          ]),
        ]}
      />,
    );

    expect(screen.getByText(/Répartition \(%\)/)).toBeInTheDocument();
    expect(
      screen.getByText(/Réfraction \(équivalent sphérique\)/),
    ).toBeInTheDocument();
  });

  test('les valeurs restent lisibles sans voir le graphique', () => {
    rtlRender(
      <AnswerCharts
        sources={[
          source([
            {
              cle: 'sex_distribution',
              valeurs: [
                { label: 'Femme', valeur: 3572 },
                { label: 'Homme', valeur: 3550 },
              ],
            },
          ]),
        ]}
      />,
    );

    // Un graphique seul ne dit rien à un lecteur d'écran : le tableau équivalent
    // doit rester dans le DOM.
    expect(
      screen.getByRole('rowheader', { name: 'Femme' }),
    ).toBeInTheDocument();
    expect(screen.getByText('3572')).toBeInTheDocument();
  });
});
