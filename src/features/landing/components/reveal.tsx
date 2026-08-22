'use client';

import { cn } from '@/lib/utils';

import { useReveal } from '../hooks/use-reveal';

interface RevealProps {
  children: React.ReactNode;
  /** Décalage en ms — met en scène une séquence, ne la disperse pas. */
  delay?: number;
  /** Sens d'entrée. `up` par défaut : suit le sens de lecture. */
  from?: 'up' | 'left' | 'right';
  className?: string;
  as?: 'div' | 'section' | 'article' | 'li';
}

const ORIGINE = {
  up: 'translate-y-6',
  left: '-translate-x-6',
  right: 'translate-x-6',
} as const;

/**
 * Enveloppe d'apparition au défilement.
 *
 * Le mouvement porte sur `opacity` et `transform` UNIQUEMENT — les deux
 * propriétés que le compositeur sait animer sans recalcul de mise en page.
 * Animer `height` ou `top` ici ferait ramer la page sur les téléphones
 * d'entrée de gamme, qui sont l'équipement réel du public visé.
 *
 * `motion-reduce:` neutralise l'animation pour qui a demandé moins de
 * mouvement — un réglage courant chez les personnes sujettes au vertige, et
 * il serait malvenu de l'ignorer sur le site d'un centre de santé.
 */
export function Reveal({
  children,
  delay = 0,
  from = 'up',
  className,
  as = 'div',
}: RevealProps) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  // `ElementType` plutôt que l'union littérale : TypeScript intersecte sinon
  // les types de `ref` des quatre balises (div ∩ section ∩ article ∩ li) et
  // aucune référence ne satisfait plus le résultat.
  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cn(
        'transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]',
        'motion-reduce:transition-none motion-reduce:translate-y-0 motion-reduce:translate-x-0',
        visible
          ? 'translate-x-0 translate-y-0 opacity-100'
          : cn('opacity-0', ORIGINE[from]),
        className,
      )}
    >
      {children}
    </Tag>
  );
}
