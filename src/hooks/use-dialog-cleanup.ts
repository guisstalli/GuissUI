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
  // Compteur de verrous de defilement laisse par Radix. Mesure sur staging :
  // il restait a « 1 » apres suppression, le menu n'ayant jamais relache le
  // sien. Le laisser en place reverrouille le defilement au montage suivant.
  document.body.removeAttribute('data-scroll-locked');
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
 * Vrai si une couche RÉELLEMENT MODALE ET OUVERTE subsiste.
 *
 * Deux precisions, chacune verifiee en direct sur staging :
 *
 * 1. `[data-state="open"]` est indispensable. Radix laisse ses couches MONTÉES
 *    apres fermeture (animation de sortie), avec `data-state="closed"`. Une
 *    garde qui teste la seule presence dans le DOM voit donc une couche fermee
 *    comme ouverte et refuse de nettoyer — DÉFINITIVEMENT. C'est exactement ce
 *    que faisait la premiere version de ce correctif : elle n'a pas debloque
 *    l'ecran, elle a remplace une cause par une autre.
 *
 * 2. Un MENU n'entre pas dans le compte. Un menu deroulant n'est pas une
 *    modale : une fois ferme, rien ne justifie que la page entiere reste
 *    inerte. Or c'est precisement le menu orphelin — ferme mais toujours
 *    monte, verrou non relache — qui gelait l'ecran apres une suppression.
 */
function uneCoucheModaleEstOuverte(): boolean {
  if (typeof document === 'undefined') {
    return false;
  }
  return Boolean(
    document.querySelector(
      '[role="dialog"][data-state="open"], [role="alertdialog"][data-state="open"]',
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

/**
 * Surveille `document.body` et le dégèle dès qu'il devient inerte sans raison.
 *
 * POURQUOI UNE SURVEILLANCE ET NON UN NETTOYAGE PONCTUEL — mesuré en direct
 * sur staging, journal de mutations à l'appui. `react-remove-scroll`, utilisé
 * par Radix, MÉMORISE `document.body.style.pointerEvents` au moment où un
 * verrou est pris, et le RESTAURE fidèlement à sa libération. Le menu
 * déroulant ayant déjà posé `none`, c'est `none` que le dialogue mémorise —
 * puis restaure en se fermant. La page reste inerte, définitivement.
 *
 * Cette restauration est la DERNIÈRE écriture : elle survient après le
 * démontage, donc après tout nettoyage déclenché par celui-ci. Les deux
 * tentatives précédentes — nettoyage synchrone, puis reprise sur les frames
 * suivantes — ont échoué pour cette seule raison : elles couraient contre une
 * écriture qui arrive toujours en dernier. On ne peut pas gagner cette course,
 * seulement constater le résultat et le corriger.
 *
 * D'où l'observateur : il ne devine aucun instant. Il réagit à l'écriture,
 * quel qu'en soit l'auteur et le moment, et ne dégèle que si plus AUCUNE
 * couche modale n'est ouverte — sinon on rendrait cliquable la page sous une
 * modale encore affichée.
 */
export function useBodyFrozenWatchdog() {
  useEffect(() => {
    if (
      typeof document === 'undefined' ||
      typeof MutationObserver === 'undefined'
    ) {
      return;
    }

    const degelerSiInjustifie = () => {
      if (document.body.style.pointerEvents !== 'none') {
        return;
      }
      if (uneCoucheModaleEstOuverte()) {
        return;
      }
      resetBodyStyles();
    };

    const observateur = new MutationObserver(degelerSiInjustifie);
    observateur.observe(document.body, {
      attributes: true,
      attributeFilter: ['style', 'data-scroll-locked'],
    });

    // Un gel déjà en place au montage ne produirait aucune mutation.
    degelerSiInjustifie();

    return () => observateur.disconnect();
  }, []);
}
