'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Révèle un élément quand il entre dans le champ de vision, une seule fois.
 *
 * Pourquoi un IntersectionObserver plutôt qu'une bibliothèque d'animation :
 * framer-motion pèse ~50 Ko gzippés pour ce que douze lignes et des
 * transitions CSS rendent aussi bien. Sur une application médicale dont les
 * budgets de bundle sont plafonnés, une vitrine n'a pas à faire payer ce prix
 * aux écrans de saisie clinique.
 *
 * `once: true` par défaut : rejouer l'animation à chaque passage rend la
 * lecture fatigante sur une page qu'on parcourt de haut en bas.
 */
export function useReveal<T extends HTMLElement = HTMLDivElement>(options?: {
  /** Marge de déclenchement — négative en bas pour révéler avant l'entrée pleine. */
  rootMargin?: string;
  once?: boolean;
}) {
  const ref = useRef<T>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Sans support de l'API (ou en rendu de test), on affiche tout de suite :
    // une vitrine ne doit JAMAIS rester vide parce qu'une animation a échoué.
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }

    // FILET DE SÉCURITÉ. Le contenu est masqué en attendant la révélation :
    // si l'observateur ne répond JAMAIS, le visiteur reste devant une page
    // blanche. C'est arrivé en vérification — un IntersectionObserver vanilla
    // ne délivrait aucun callback dans le navigateur de test — et cela peut
    // arriver en vrai : onglet ouvert en arrière-plan, moteur ancien, script
    // partiellement chargé. Une vitrine de centre de santé doit s'afficher
    // même quand l'animation échoue ; l'animation est un plus, jamais une
    // condition de lisibilité.
    const filet = setTimeout(() => setVisible(true), 1200);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          clearTimeout(filet);
          setVisible(true);
          if (options?.once !== false) observer.disconnect();
        } else if (options?.once === false) {
          setVisible(false);
        }
      },
      {
        rootMargin: options?.rootMargin ?? '0px 0px -12% 0px',
        threshold: 0.05,
      },
    );

    observer.observe(element);
    return () => {
      clearTimeout(filet);
      observer.disconnect();
    };
  }, [options?.rootMargin, options?.once]);

  return { ref, visible };
}
