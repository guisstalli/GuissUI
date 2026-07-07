/**
 * Tests d'intégration — ChatInput
 *
 * Couvre :
 * - Bouton Envoyer désactivé quand le champ est vide (ou espaces seuls)
 * - onSend appelé avec la question trimée, champ vidé après envoi
 * - Entrée envoie ; Maj+Entrée insère une nouvelle ligne sans envoyer
 * - disabled bloque l'envoi (mutation en cours)
 */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';

import { ChatInput } from '../chat-input';

describe('ChatInput', () => {
  test('le bouton Envoyer est désactivé quand le champ est vide', () => {
    render(<ChatInput onSend={vi.fn()} />);

    expect(screen.getByRole('button', { name: /envoyer/i })).toBeDisabled();
  });

  test("le bouton reste désactivé si la saisie n'est que des espaces", async () => {
    render(<ChatInput onSend={vi.fn()} />);

    await userEvent.type(
      screen.getByRole('textbox', { name: /question/i }),
      '   ',
    );

    expect(screen.getByRole('button', { name: /envoyer/i })).toBeDisabled();
  });

  test('envoie la question trimée et vide le champ', async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const textbox = screen.getByRole('textbox', { name: /question/i });
    await userEvent.type(textbox, '  Combien de patients ?  ');
    await userEvent.click(screen.getByRole('button', { name: /envoyer/i }));

    expect(onSend).toHaveBeenCalledOnce();
    expect(onSend).toHaveBeenCalledWith('Combien de patients ?');
    expect(textbox).toHaveValue('');
  });

  test('Entrée envoie la question, Maj+Entrée non', async () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);

    const textbox = screen.getByRole('textbox', { name: /question/i });
    await userEvent.type(textbox, 'Ligne 1');
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');
    expect(onSend).not.toHaveBeenCalled();

    await userEvent.keyboard('{Enter}');
    expect(onSend).toHaveBeenCalledOnce();
    expect(onSend).toHaveBeenCalledWith('Ligne 1');
  });

  test('disabled bloque la saisie et le bouton', () => {
    render(<ChatInput onSend={vi.fn()} disabled />);

    expect(screen.getByRole('textbox', { name: /question/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /envoyer/i })).toBeDisabled();
  });
});
