'use client';

import { useMemo } from 'react';
import type { Components } from 'react-markdown';

import { cn } from '@/utils/cn';

import { numeroDeCitation } from '../../utils/citations';

type MarqueurProps = {
  numero: number;
  onSelect: (numero: number) => void;
};

/**
 * Renvoi « [n] » vers la carte source qui porte le chiffre qui précède.
 *
 * Rendu en bouton et non en lien : la destination n'est pas une page mais une
 * carte à déplier dans le fil. Un `<a href="#…">` aurait fait sauter le
 * navigateur vers une ancre repliée, donc invisible.
 */
function Marqueur({ numero, onSelect }: MarqueurProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(numero)}
      aria-label={`Voir la source ${numero}`}
      className={cn(
        'mx-0.5 inline-flex min-w-[1.25rem] items-center justify-center rounded',
        'bg-primary/10 px-1 align-super text-[10px] font-medium leading-4 text-primary',
        'transition-colors hover:bg-primary hover:text-primary-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      {numero}
    </button>
  );
}

/**
 * Surcharge du rendu des liens : les ancres de citation deviennent des
 * marqueurs cliquables, tout autre lien garde le rendu par défaut.
 */
export function useCitationComponents(
  onSelect: (numero: number) => void,
): Components {
  return useMemo(
    () => ({
      a({ href, children, ...props }) {
        const numero = numeroDeCitation(href);
        if (numero === null) {
          return (
            <a href={href} {...props}>
              {children}
            </a>
          );
        }
        return <Marqueur numero={numero} onSelect={onSelect} />;
      },
    }),
    [onSelect],
  );
}
