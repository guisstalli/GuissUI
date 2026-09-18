import { describe, expect, test } from 'vitest';

import { rtlRender, screen } from '@/testing/test-utils';

import { ChatProgress } from '../chat-progress';

/**
 * Le serveur émettait déjà ses étapes, mais l'interface les écrasait dans une
 * seule ligne de statut : après quarante secondes d'attente, l'utilisateur
 * n'avait vu qu'un message immobile.
 */
describe('Déroulé de la réponse', () => {
  test('aucune étape ne produit aucun bloc', () => {
    const { container } = rtlRender(<ChatProgress etapes={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  test('chaque étape est listée avec les outils consultés', () => {
    rtlRender(
      <ChatProgress
        etapes={[
          { index: 0, outils: ['get_analytics'], terminee: true },
          { index: 1, outils: [], terminee: false },
        ]}
      />,
    );

    expect(screen.getByText(/Étape 1 — get_analytics/)).toBeInTheDocument();
    expect(screen.getByText(/Étape 2/)).toBeInTheDocument();
  });

  test('la liste est annoncée aux lecteurs d’écran', () => {
    rtlRender(
      <ChatProgress etapes={[{ index: 0, outils: [], terminee: false }]} />,
    );

    expect(
      screen.getByRole('list', { name: /Déroulé de la réponse/ }),
    ).toBeInTheDocument();
  });
});
