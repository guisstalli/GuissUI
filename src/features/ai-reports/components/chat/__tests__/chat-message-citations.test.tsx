/**
 * Tests d'intégration — citations cliquables dans une réponse.
 *
 * Le backend écrit « 4069 [1] patients » : chaque chiffre porte le rang de
 * l'outil qui l'a produit. Laissé en texte, le marqueur oblige le lecteur à
 * déplier l'accordéon « Sources » et à recompter les cartes. Ces tests
 * vérifient que le renvoi fait le trajet à sa place.
 */
import { describe, expect, test } from 'vitest';

import { rtlRender, screen, userEvent } from '@/testing/test-utils';

import type {
  ChatMessage as ChatMessageType,
  SourceDisplay,
} from '../../../types';
import { ChatMessage } from '../chat-message';

const cartes: SourceDisplay[] = [
  {
    tool: 'get_overview',
    label: "Vue d'ensemble de la cohorte",
    filters: [],
    cell_count: 4069,
  },
  {
    tool: 'get_glaucoma',
    label: 'Dépistage du glaucome',
    filters: [],
    cell_count: 512,
  },
];

const reponse = (contenu: string): ChatMessageType =>
  ({
    id: 'm1',
    role: 'assistant',
    content: contenu,
    sources_display: cartes,
    tools_used: ['get_overview', 'get_glaucoma'],
    timestamp: Date.now(),
  }) as unknown as ChatMessageType;

describe('Citations cliquables', () => {
  test('chaque marqueur du texte devient un renvoi vers sa source', () => {
    rtlRender(
      <ChatMessage
        message={reponse('4069 [1] patients, dont 512 [2] suspects.')}
      />,
    );

    expect(
      screen.getByRole('button', { name: 'Voir la source 1' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Voir la source 2' }),
    ).toBeInTheDocument();
  });

  test('cliquer un renvoi ouvre les sources et désigne la bonne carte', async () => {
    const user = userEvent.setup();
    rtlRender(
      <ChatMessage
        message={reponse('4069 [1] patients, dont 512 [2] suspects.')}
      />,
    );

    // Replié au départ : sans clic, la carte n'est pas à l'écran.
    expect(screen.queryByText('Dépistage du glaucome')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Voir la source 2' }));

    expect(
      await screen.findByText('Dépistage du glaucome'),
    ).toBeInTheDocument();
    const designee = await screen.findByTestId('source-card-2');
    expect(designee).toHaveAttribute('data-designee', 'true');
    expect(screen.getByTestId('source-card-1')).not.toHaveAttribute(
      'data-designee',
    );
  });

  test('une réponse sans marqueur laisse les sources repliées', () => {
    rtlRender(<ChatMessage message={reponse('Aucun chiffre sourcé ici.')} />);

    expect(
      screen.queryByRole('button', { name: /Voir la source/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Vue d'ensemble de la cohorte"),
    ).not.toBeInTheDocument();
  });
});
