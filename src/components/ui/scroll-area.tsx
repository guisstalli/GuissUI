'use client';

import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui';
import * as React from 'react';

import { cn } from '@/lib/utils';

type ScrollAreaProps = React.ComponentProps<typeof ScrollAreaPrimitive.Root> & {
  /**
   * Accès au viewport interne (l'élément qui défile réellement).
   *
   * Les props de ce composant vont sur `Root`, qui ne défile pas : sans cette
   * échappatoire, impossible de lire `scrollTop` ou de brancher `onScroll` —
   * or l'événement `scroll` ne remonte pas via React depuis un enfant.
   */
  viewportRef?: React.Ref<HTMLDivElement>;
  /** Handler de défilement, posé sur le viewport et non sur la racine. */
  onViewportScroll?: React.UIEventHandler<HTMLDivElement>;
};

function ScrollArea({
  className,
  children,
  viewportRef,
  onViewportScroll,
  ...props
}: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn('relative', className)}
      {...props}
    >
      {/*
        `[&>div]:!block` : Radix rend un wrapper interne en `display: table`, qui
        se DIMENSIONNE SUR SON CONTENU au lieu de le rogner. Mesuré sur
        /assistant-ia : 1768 px de contenu dans un conteneur de 256 px, d'où un
        scroll horizontal parasite — et un `truncate` enfant rendu inopérant
        (une cellule de tableau s'élargit, elle ne tronque pas). On force `block`
        pour que la largeur vienne du parent et non du contenu.
      */}
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        onScroll={onViewportScroll}
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full min-w-0 rounded-[inherit] outline-none transition-[color,box-shadow] focus-visible:outline-1 focus-visible:ring [&>div]:!block [&>div]:!min-w-0"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = 'vertical',
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        'flex touch-none p-px transition-colors select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent',
        className,
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="relative flex-1 rounded-full bg-border"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  );
}

export { ScrollArea, ScrollBar };
