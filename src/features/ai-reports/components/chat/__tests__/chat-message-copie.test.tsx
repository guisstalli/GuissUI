import { describe, expect, test } from 'vitest';

import { rtlRender, screen, userEvent } from '@/testing/test-utils';

import type { ChatMessage as ChatMessageType } from '../../../types';
import { ChatMessage } from '../chat-message';

const reponse = (contenu: string): ChatMessageType =>
  ({
    id: 'm1',
    role: 'assistant',
    content: contenu,
    timestamp: Date.now(),
  }) as unknown as ChatMessageType;

describe('Copier une réponse', () => {
  test('le texte de la réponse part dans le presse-papiers', async () => {
    // `userEvent.setup()` installe son propre presse-papiers de test : on lit
    // ce qui s'y trouve plutôt que d'espionner une méthode qu'il remplace.
    const user = userEvent.setup();
    rtlRender(<ChatMessage message={reponse('80 patients examinés.')} />);

    await user.click(screen.getByRole('button', { name: /Copier/ }));

    await expect(navigator.clipboard.readText()).resolves.toBe(
      '80 patients examinés.',
    );
    expect(await screen.findByText('Copié')).toBeInTheDocument();
  });

  test('une réponse vide ne propose pas de copie', () => {
    rtlRender(<ChatMessage message={reponse('   ')} />);

    expect(
      screen.queryByRole('button', { name: /Copier/ }),
    ).not.toBeInTheDocument();
  });

  test('un message utilisateur ne propose pas de copie', () => {
    rtlRender(
      <ChatMessage
        message={{ ...reponse('ma question'), role: 'user' } as ChatMessageType}
      />,
    );

    expect(
      screen.queryByRole('button', { name: /Copier/ }),
    ).not.toBeInTheDocument();
  });
});
