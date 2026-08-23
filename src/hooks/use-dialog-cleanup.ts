import { useEffect } from 'react';

/**
 * Resets the styles Radix UI leaves on `document.body` while a modal is open
 * (`pointer-events: none`, and sometimes `overflow: hidden`) but occasionally
 * fails to remove if the component unmounts before the close animation finishes.
 * SSR-safe — only touches `document` in the browser.
 */
function resetBodyStyles() {
  if (typeof document === 'undefined') {
    return;
  }
  document.body.style.removeProperty('pointer-events');
  document.body.style.removeProperty('overflow');
}

/**
 * Removes the `pointer-events: none` Radix UI sometimes leaves on document.body
 * when a Dialog unmounts or closes mid-animation.
 *
 * Pass the `open` boolean(s) of every Dialog on the page so the cleanup runs
 * whenever any of them transitions from open → closed.
 */
export function useDialogCleanup(openStates: boolean[]) {
  const anyOpen = openStates.some(Boolean);

  useEffect(() => {
    if (!anyOpen) {
      resetBodyStyles();
    }
  }, [anyOpen]);
}

/**
 * Vrai si une couche modale Radix est ENCORE montée (dialogue, alerte, menu).
 *
 * Sans cette garde, fermer un dialogue empilé sur un autre rendrait la page
 * du dessous cliquable alors qu'une modale est toujours ouverte — on
 * remplacerait un écran gelé par une modale qui ne bloque plus rien.
 */
function uneCoucheModaleEstOuverte(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }
  return Boolean(
    document.querySelector(
      '[role="dialog"], [role="alertdialog"], [role="menu"]',
    ),
  );
}

function resetBodyStylesSiPlusAucuneCouche() {
  if (uneCoucheModaleEstOuverte()) {
    return;
  }
  resetBodyStyles();
}

/**
 * Restaure l'interactivité de `document.body` au démontage d'une couche modale.
 *
 * PIÈGE CORRIGÉ — l'« écran gelé » après suppression d'un patient. Le menu
 * déroulant pose `pointer-events: none` sur le body. Le dialogue de
 * confirmation s'ouvre PAR-DESSUS et mémorise la valeur d'origine, qui vaut
 * déjà `none`. À sa fermeture il « restaure » donc `none`, et le menu étant
 * déjà démonté, plus personne ne remet la valeur vide : la page entière
 * devenait définitivement inerte, sans message ni erreur.
 *
 * Un nettoyage SYNCHRONE au démontage ne suffit pas : il s'exécute AVANT la
 * restauration de Radix, qui le réécrase juste après. D'où la reprise sur les
 * frames suivantes — c'est la seule qui gagne la course.
 *
 * `setTimeout` en filet : `requestAnimationFrame` ne se déclenche pas dans un
 * onglet en arrière-plan, et l'utilisateur retrouverait l'écran gelé en y
 * revenant.
 */
export function useBodyPointerEventsCleanup() {
  useEffect(() => {
    return () => {
      resetBodyStyles();

      if (typeof window === 'undefined') {
        return;
      }
      window.requestAnimationFrame(() => {
        resetBodyStylesSiPlusAucuneCouche();
        window.requestAnimationFrame(resetBodyStylesSiPlusAucuneCouche);
      });
      window.setTimeout(resetBodyStylesSiPlusAucuneCouche, 150);
    };
  }, []);
}

export { resetBodyStyles };
