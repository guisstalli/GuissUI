import { afterEach, describe, expect, test, vi } from 'vitest';

import {
  useBodyFrozenWatchdog,
  useBodyPointerEventsCleanup,
} from '@/hooks/use-dialog-cleanup';
import { rtlRender, waitFor } from '@/testing/test-utils';

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
    // precisement ce qu'un nettoyage synchrone ne peut pas rattraper.
    document.body.style.pointerEvents = 'none';

    await vi.advanceTimersByTimeAsync(300);

    expect(document.body).not.toHaveStyle({ pointerEvents: 'none' });
  });

  test('ne debloque PAS le body si une modale est encore OUVERTE', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    const ouverte = document.createElement('div');
    ouverte.setAttribute('role', 'alertdialog');
    ouverte.setAttribute('data-state', 'open');
    document.body.appendChild(ouverte);

    const { unmount } = rtlRender(<CoucheModale />);
    unmount();
    document.body.style.pointerEvents = 'none';

    await vi.advanceTimersByTimeAsync(300);

    // Sinon on remplacerait un ecran gele par une modale qui ne bloque plus rien.
    expect(document.body).toHaveStyle({ pointerEvents: 'none' });

    ouverte.remove();
  });

  test('un menu FERME mais encore monte ne gele pas la page', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });

    // CAS REEL, mesure en production : apres fermeture, Radix laisse le menu
    // dans le DOM avec data-state="closed" (et meme display: block). Une garde
    // qui regarde la seule PRESENCE de l'element croit a une modale ouverte
    // pour toujours et bloque definitivement le nettoyage qu'elle devait
    // proteger. La premiere version de ce correctif echouait exactement la,
    // avec des tests verts : ils n'utilisaient que des elements synthetiques.
    const menu = document.createElement('div');
    menu.setAttribute('role', 'menu');
    menu.setAttribute('data-state', 'closed');
    document.body.appendChild(menu);

    const { unmount } = rtlRender(<CoucheModale />);
    unmount();
    document.body.style.pointerEvents = 'none';

    await vi.advanceTimersByTimeAsync(300);

    expect(document.body).not.toHaveStyle({ pointerEvents: 'none' });

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

function Filet() {
  useBodyFrozenWatchdog();
  return null;
}

/**
 * Le defaut REEL, mesure sur staging journal de mutations a l'appui :
 * `react-remove-scroll` memorise `pointer-events` a la prise du verrou et le
 * RESTAURE a sa liberation. Le menu ayant deja pose `none`, c'est `none` que
 * le dialogue memorise puis restaure en se fermant — et cette ecriture arrive
 * APRES le demontage, donc apres tout nettoyage qu'il declenche.
 */
describe('Filet contre le gel tardif du body', () => {
  test('degele apres une ecriture POSTERIEURE au demontage', async () => {
    rtlRender(<Filet />);

    // Ce qu'aucun nettoyage lie au demontage ne peut devancer.
    document.body.style.pointerEvents = 'none';

    await waitFor(() =>
      expect(document.body).not.toHaveStyle({ pointerEvents: 'none' }),
    );
  });

  test('ne degele PAS sous une modale encore ouverte', async () => {
    const ouverte = document.createElement('div');
    ouverte.setAttribute('role', 'dialog');
    ouverte.setAttribute('data-state', 'open');
    document.body.appendChild(ouverte);

    rtlRender(<Filet />);
    document.body.style.pointerEvents = 'none';

    await new Promise((r) => setTimeout(r, 60));

    expect(document.body).toHaveStyle({ pointerEvents: 'none' });

    ouverte.remove();
  });

  test('degele un body deja fige AVANT le montage', async () => {
    document.body.style.pointerEvents = 'none';

    rtlRender(<Filet />);

    // Aucune mutation ne se produirait : l'etat initial doit etre inspecte.
    await waitFor(() =>
      expect(document.body).not.toHaveStyle({ pointerEvents: 'none' }),
    );
  });
});
