/**
 * Tests d'intégration — ChatSourcesAccordion (sources lisibles)
 *
 * Couvre :
 * - Cartes françaises : libellé de l'indicateur, chips de filtres, effectif
 * - Le JSON brut n'est PAS affiché par défaut (replié sous « Détails techniques »)
 * - Repli technique : badges d'outils + JSON brut après ouverture
 * - Fallback : rien n'est rendu sans sources ni outils
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import type { SourceDisplay } from '../../../types';
import { ChatSourcesAccordion } from '../chat-sources-accordion';

const sourcesDisplay: SourceDisplay[] = [
  {
    tool: 'get_glaucoma',
    label: 'Dépistage du glaucome',
    filters: [
      { label: 'Période', value: 'du 01/01/2026 au 30/06/2026' },
      { label: 'Sites', value: 'Centre Dakar' },
    ],
    cell_count: 128,
  },
  {
    tool: 'resolve_site',
    label: 'Résolution de site',
    filters: [],
    cell_count: null,
  },
];

const rawSources = { get_glaucoma: { to_sup_21: 12 } };

describe('ChatSourcesAccordion', () => {
  test('affiche les cartes lisibles : libellé FR, filtres, effectif', async () => {
    render(
      <ChatSourcesAccordion
        sources={rawSources}
        sources_display={sourcesDisplay}
        tools_used={['get_glaucoma', 'resolve_site']}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: /sources et outils utilisés/i }),
    );

    expect(screen.getByText('Dépistage du glaucome')).toBeInTheDocument();
    expect(
      screen.getByText(/période : du 01\/01\/2026 au 30\/06\/2026/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/sites : centre dakar/i)).toBeInTheDocument();
    expect(screen.getByText('Basé sur 128 examens')).toBeInTheDocument();
    // cell_count null → pas de mention d'effectif sur cette carte
    expect(screen.getByText('Résolution de site')).toBeInTheDocument();
  });

  test('le JSON brut est replié par défaut sous « Détails techniques »', async () => {
    render(
      <ChatSourcesAccordion
        sources={rawSources}
        sources_display={sourcesDisplay}
        tools_used={['get_glaucoma']}
      />,
    );

    await userEvent.click(
      screen.getByRole('button', { name: /sources et outils utilisés/i }),
    );

    // Pas de JSON brut ni de nom technique visible avant l'ouverture du repli
    expect(screen.queryByText(/to_sup_21/)).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: /détails techniques/i }),
    );

    expect(screen.getByText('get_glaucoma')).toBeInTheDocument();
    expect(screen.getByText(/to_sup_21/)).toBeInTheDocument();
  });

  test('ne rend rien sans sources ni outils', () => {
    const { container } = render(<ChatSourcesAccordion />);

    expect(container).toBeEmptyDOMElement();
  });
});
