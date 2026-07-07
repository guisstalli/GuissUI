/**
 * Tests d'intégration — ChatMessageList / ChatMessage
 *
 * Couvre :
 * - État vide : invite + exemples de questions
 * - Rendu markdown de la réponse assistant (gras → <strong>)
 * - Indicateur « réflexion en cours » pendant l'appel ask/
 * - Message d'erreur (quota 429) affiché dans le fil
 * - Sources / outils repliables présents quand fournis
 */
import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import type { ChatMessage } from '../../../types';
import { ChatMessageList } from '../chat-message-list';

const userMessage: ChatMessage = {
  id: 'u1',
  role: 'user',
  content: 'Combien de patients ?',
  timestamp: 1,
};

const assistantMessage: ChatMessage = {
  id: 'a1',
  role: 'assistant',
  content: 'Il y a **55 examens** au total.',
  sources: { get_overview: { examens_total: 55 } },
  tools_used: ['get_overview'],
  timestamp: 2,
};

describe('ChatMessageList', () => {
  test("affiche l'état vide avec des exemples de questions", () => {
    render(<ChatMessageList messages={[]} isThinking={false} />);

    expect(
      screen.getByText(/posez une question analytique/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/combien de patients ont été examinés/i),
    ).toBeInTheDocument();
  });

  test('rend la question utilisateur et la réponse markdown', () => {
    render(
      <ChatMessageList
        messages={[userMessage, assistantMessage]}
        isThinking={false}
      />,
    );

    expect(screen.getByText('Combien de patients ?')).toBeInTheDocument();
    // Le markdown **55 examens** doit être rendu en <strong>
    const strong = screen.getByText('55 examens');
    expect(strong.tagName).toBe('STRONG');
  });

  test("affiche l'indicateur de réflexion pendant l'appel", () => {
    render(<ChatMessageList messages={[userMessage]} isThinking />);

    expect(screen.getByRole('status')).toHaveTextContent(
      /l'assistant analyse les données/i,
    );
  });

  test('affiche un message d’erreur dans le fil (quota atteint)', () => {
    const errorMessage: ChatMessage = {
      id: 'e1',
      role: 'assistant',
      content: 'Limite de questions atteinte (30 par heure).',
      timestamp: 3,
      isError: true,
    };
    render(<ChatMessageList messages={[errorMessage]} isThinking={false} />);

    expect(
      screen.getByText(/limite de questions atteinte/i),
    ).toBeInTheDocument();
  });

  test('expose les sources et outils utilisés (accordéon)', () => {
    render(
      <ChatMessageList messages={[assistantMessage]} isThinking={false} />,
    );

    expect(
      screen.getByRole('button', { name: /sources et outils utilisés/i }),
    ).toBeInTheDocument();
  });
});
