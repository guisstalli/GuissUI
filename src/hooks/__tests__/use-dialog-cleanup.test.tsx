import { afterEach, describe, expect, test, vi } from 'vitest';

import { useBodyPointerEventsCleanup } from '@/hooks/use-dialog-cleanup';
import { rtlRender } from '@/testing/test-utils';

function CoucheModale() {
  useBodyPointerEventsCleanup();
  return <div role="dialog">contenu</div>;
}

afterEach(() => {
  document.body.style.removeProperty('pointer-events');
  document.body.removeAttribute('data-scroll-locked');
  vi.useRealTimers();
});

/**
 * Regression — l'« ecran gele » apres suppression d'un patient.
 *
 * Le menu deroulant pose `pointer-events: none` sur le body. Le dialogue de
 * confirmation s'ouvre PAR-DESSUS et memorise la valeur d'origine, qui vaut
 * deja `none` : a sa fermeture il « restaure » donc `none`, et le menu etant
 * deja demonte, plus personne ne remet la valeur vide. La page entiere
 * devenait definitivement inerte, sans message ni erreur.
 */
describe('Restauration du body au demontage d une modale', () => {
  test('efface pointer-events reapplique APRES le demontage', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const { unmount } = rtlRender(<CoucheModale />);

    unmount();

    // Radix restaure sa valeur memorisee APRES le demontage : c'est
    // precisement ce que le nettoyage synchrone ne pouvait pas rattraper.
    document.body.style.pointerEvents = 'none';

    await vi.advanceTimersByTimeAsync(300);

    expect(document.body).not.toHaveStyle({ pointerEvents: 'none' });
  });

  test('ne debloque PAS le body si une autre modale reste ouverte', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    // Une seconde couche, toujours montee (cas des dialogues empiles).
    const autre = document.createElement('div');
    autre.setAttribute('role', 'alertdialog');
    autre.setAttribute('data-state', 'open');
    document.body.appendChild(autre);

    const { unmount } = rtlRender(<CoucheModale />);
    unmount();
    document.body.style.pointerEvents = 'none';

    await vi.advanceTimersByTimeAsync(300);

    // Sinon on remplacerait un ecran gele par une modale qui ne bloque plus rien.
    expect(document.body).toHaveStyle({ pointerEvents: 'none' });

    autre.remove();
  });

  test('un menu FERME mais encore monte ne gele pas la page', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    // Radix laisse ses couches montees apres fermeture (animation de sortie).
    // Ce menu orphelin, verrou non relache, etait la vraie cause du gel — et
    // la premiere version de la garde le prenait pour une modale ouverte,
    // refusant de nettoyer definitivement.
    const menu = document.createElement('div');
    menu.setAttribute('role', 'menu');
    menu.setAttribute('data-state', 'closed');
    document.body.appendChild(menu);
    document.body.setAttribute('data-scroll-locked', '1');

    const { unmount } = rtlRender(<CoucheModale />);
    unmount();
    document.body.style.pointerEvents = 'none';

    await vi.advanceTimersByTimeAsync(300);

    expect(document.body).not.toHaveStyle({ pointerEvents: 'none' });
    expect(document.body).not.toHaveAttribute('data-scroll-locked');

    menu.remove();
  });

  test('un dialogue FERME mais encore monte ne gele pas non plus', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const fantome = document.createElement('div');
    fantome.setAttribute('role', 'dialog');
    fantome.setAttribute('data-state', 'closed');
    document.body.appendChild(fantome);

    const { unmount } = rtlRender(<CoucheModale />);
    unmount();
    document.body.style.pointerEvents = 'none';

    await vi.advanceTimersByTimeAsync(300);

    expect(document.body).not.toHaveStyle({ pointerEvents: 'none' });

    fantome.remove();
  });
});
