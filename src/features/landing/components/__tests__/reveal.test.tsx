import { render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ChampVisuel } from '../champ-visuel';
import { Reveal } from '../reveal';

/**
 * Ces tests protègent une seule chose, et c'est la plus importante d'une
 * vitrine : le contenu doit FINIR PAR S'AFFICHER, quoi qu'il arrive à
 * l'animation.
 *
 * Le piège est réel et déjà rencontré dans ce dépôt : la page précédente
 * appelait une classe `landing-rise` définie nulle part — les entrées
 * échelonnées ne s'exécutaient pas, sans que personne ne le voie. Ici l'enjeu
 * est pire : le contenu part masqué, donc une animation qui ne se déclenche
 * jamais laisse une page BLANCHE.
 */

type Rappel = (entrees: { isIntersecting: boolean }[]) => void;

let rappels: Rappel[] = [];

/** Observateur factice : on décide NOUS-MÊMES s'il notifie, et quand. */
class ObservateurFactice {
  constructor(private rappel: Rappel) {
    rappels.push(rappel);
  }
  observe() {}
  disconnect() {}
  unobserve() {}
}

beforeEach(() => {
  rappels = [];
  vi.stubGlobal('IntersectionObserver', ObservateurFactice);
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/** Simule l'entrée de l'élément dans le champ de vision. */
function entrerDansLeChamp() {
  rappels.forEach((rappel) => rappel([{ isIntersecting: true }]));
}

describe('Reveal', () => {
  it('part masqué, pour que l’entrée soit perceptible', () => {
    render(<Reveal>Contenu</Reveal>);
    expect(screen.getByText('Contenu')).toHaveClass('opacity-0');
  });

  it('se révèle quand l’élément entre dans le champ de vision', async () => {
    render(<Reveal>Contenu</Reveal>);

    entrerDansLeChamp();

    await waitFor(() =>
      expect(screen.getByText('Contenu')).toHaveClass('opacity-100'),
    );
  });

  it('S’AFFICHE QUAND MÊME si l’observateur ne notifie jamais', async () => {
    // Le cas qui compte : onglet ouvert en arrière-plan, moteur ancien, script
    // partiellement chargé. Sans filet, le visiteur reste devant du vide.
    render(<Reveal>Contenu</Reveal>);
    expect(screen.getByText('Contenu')).toHaveClass('opacity-0');

    vi.advanceTimersByTime(1300);

    await waitFor(() =>
      expect(screen.getByText('Contenu')).toHaveClass('opacity-100'),
    );
  });

  it('neutralise le mouvement pour qui a demandé moins d’animation', () => {
    render(<Reveal>Contenu</Reveal>);
    // Réglage courant chez les personnes sujettes au vertige : il serait
    // malvenu de l'ignorer sur le site d'un centre de santé.
    expect(screen.getByText('Contenu')).toHaveClass(
      'motion-reduce:transition-none',
    );
  });
});

/* eslint-disable testing-library/no-container, testing-library/no-node-access --
   Les <circle> d'un SVG ne portent aucun rôle accessible : ils ne sont pas
   atteignables par les requêtes de Testing Library. Compter les points du
   relevé exige donc un accès DOM direct — exception assumée et bornée à ce
   bloc. */
describe('ChampVisuel', () => {
  it('trace les 24 points du relevé', () => {
    const { container } = render(<ChampVisuel />);
    expect(container.querySelectorAll('circle.fill-cyan-500')).toHaveLength(24);
  });

  it('affiche les points même si l’observateur reste muet', async () => {
    const { container } = render(<ChampVisuel />);
    const premier = container.querySelector<SVGCircleElement>(
      'circle.fill-cyan-500',
    );
    expect(premier?.style.opacity).toBe('0');

    vi.advanceTimersByTime(1300);

    await waitFor(() => expect(premier?.style.opacity).toBe('1'));
  });

  it('décrit le relevé pour les lecteurs d’écran', () => {
    render(<ChampVisuel />);
    expect(screen.getByRole('img')).toHaveAttribute(
      'aria-label',
      expect.stringMatching(/champ visuel/i),
    );
  });
});
/* eslint-enable testing-library/no-container, testing-library/no-node-access */
