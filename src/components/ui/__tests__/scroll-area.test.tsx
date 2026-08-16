import { render, screen } from '@testing-library/react';

import { ScrollArea } from '../scroll-area';

/**
 * Radix rend, à l'intérieur du Viewport, un wrapper en `display: table` qui se
 * dimensionne SUR SON CONTENU au lieu de le rogner. Mesuré en production sur
 * /assistant-ia : 1768 px de contenu dans un conteneur de 256 px — scroll
 * horizontal parasite, et `truncate` rendu inopérant (une cellule de tableau
 * s'élargit, elle ne tronque pas).
 *
 * Ce garde-fou existe parce que `scroll-area.tsx` est un composant généré par
 * le CLI shadcn : une régénération écraserait silencieusement le correctif.
 */
describe('ScrollArea', () => {
  it('force le wrapper interne de Radix en block pour ne pas suivre le contenu', () => {
    const { container } = render(
      <ScrollArea>
        <div>contenu</div>
      </ScrollArea>,
    );

    // Le viewport est un nœud de MISE EN PAGE : ni rôle, ni texte, ni libellé
    // accessible. Aucune requête Testing Library ne peut l'atteindre, et c'est
    // précisément ce nœud dont on doit vérifier les classes.
    // eslint-disable-next-line testing-library/no-container, testing-library/no-node-access
    const viewport = container.querySelector(
      '[data-slot="scroll-area-viewport"]',
    );
    expect(viewport).not.toBeNull();
    // Sans ces overrides, le contenu impose sa largeur au conteneur.
    expect(viewport?.className).toContain('[&>div]:!block');
    expect(viewport?.className).toContain('min-w-0');
  });

  it('rend ses enfants', () => {
    render(
      <ScrollArea>
        <p>message</p>
      </ScrollArea>,
    );
    expect(screen.getByText('message')).toBeInTheDocument();
  });
});
