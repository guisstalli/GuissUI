/**
 * Tests — ChatTrajectoryAccordion (trajectoire agentique repliée)
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { ChatTrajectoryAccordion } from '../chat-trajectory-accordion';

const trajectory = [
  {
    index: 0,
    text: 'Je vérifie.',
    tool_calls: ['cohort_proportion'],
    errors: [],
  },
  {
    index: 1,
    text: 'Je corrige.',
    tool_calls: ['cohort_proportion'],
    errors: ['Arguments invalides : seuil manquant'],
  },
  { index: 2, text: 'Réponse finale.', tool_calls: [], errors: [] },
];

describe('ChatTrajectoryAccordion', () => {
  test('rien à rendre sans appel d’outil', () => {
    const { container } = render(<ChatTrajectoryAccordion trajectory={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('résumé replié : nombre total d’appels d’outils', () => {
    render(<ChatTrajectoryAccordion trajectory={trajectory} />);
    expect(
      screen.getByRole('button', {
        name: /raisonnement de l'agent \(2 appels/i,
      }),
    ).toBeInTheDocument();
    // Replié : les étapes ne sont pas visibles
    expect(screen.queryByText(/étape 1/i)).not.toBeInTheDocument();
  });

  test('déplié : étapes avec outils et erreurs auto-corrigées', async () => {
    render(<ChatTrajectoryAccordion trajectory={trajectory} />);

    await userEvent.click(
      screen.getByRole('button', { name: /raisonnement/i }),
    );

    expect(screen.getByText(/étape 1/i)).toBeInTheDocument();
    expect(screen.getAllByText('cohort_proportion')).toHaveLength(2);
    expect(
      screen.getByText(/1 erreur d'outil auto-corrigée/i),
    ).toBeInTheDocument();
    // L'étape sans outil ni erreur (réponse finale) est filtrée
    expect(screen.queryByText(/étape 3/i)).not.toBeInTheDocument();
  });
});
