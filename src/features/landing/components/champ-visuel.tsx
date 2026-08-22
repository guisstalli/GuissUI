'use client';

import { useReveal } from '../hooks/use-reveal';

// Le filet de securite de `useReveal` couvre aussi ce composant : si
// l'observateur ne repond pas, les points s'affichent quand meme.

/** Points du relevé, par anneau d'excentricité. */
const ANNEAUX = [
  { rayon: 10, points: 4, retard: 0 },
  { rayon: 20, points: 8, retard: 220 },
  { rayon: 30, points: 12, retard: 440 },
];

/**
 * Relevé de champ visuel qui se trace point par point.
 *
 * C'est l'unique moment fort de la page, et il est CHOISI : la périmétrie est
 * l'examen signature du centre — c'est elle qui fonde le programme « sécurité
 * routière », puisqu'un conducteur peut avoir 10/10 et un champ visuel amputé
 * sans le savoir. Un motif abstrait aurait été aussi joli et n'aurait rien
 * dit ; celui-ci montre ce qu'on vient chercher au centre.
 *
 * Les points apparaissent par anneaux, du centre vers la périphérie, dans
 * l'ordre où un périmètre les teste.
 */
export function ChampVisuel() {
  const { ref, visible } = useReveal<HTMLDivElement>();

  return (
    <div ref={ref} className="relative mx-auto aspect-square w-full max-w-md">
      <svg
        viewBox="-40 -40 80 80"
        className="size-full"
        role="img"
        aria-label="Relevé de champ visuel : des points de test disposés en anneaux concentriques autour du point de fixation."
      >
        {[10, 20, 30].map((rayon) => (
          <circle
            key={rayon}
            r={rayon}
            className="fill-none stroke-slate-900/10"
            strokeWidth={0.3}
          />
        ))}
        <line
          x1={-34}
          y1={0}
          x2={34}
          y2={0}
          className="stroke-slate-900/10"
          strokeWidth={0.3}
        />
        <line
          x1={0}
          y1={-34}
          x2={0}
          y2={34}
          className="stroke-slate-900/10"
          strokeWidth={0.3}
        />

        {ANNEAUX.flatMap(({ rayon, points, retard }) =>
          Array.from({ length: points }, (_, i) => {
            const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
            return (
              <circle
                key={`${rayon}-${i}`}
                cx={Math.cos(angle) * rayon}
                cy={Math.sin(angle) * rayon}
                r={1.6}
                className="fill-cyan-500 transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none"
                style={{
                  opacity: visible ? 1 : 0,
                  transformOrigin: 'center',
                  transform: visible ? 'scale(1)' : 'scale(0.2)',
                  transitionDelay: `${retard + i * 45}ms`,
                }}
              />
            );
          }),
        )}

        <circle
          r={2.2}
          className="fill-slate-900 transition-opacity duration-500 motion-reduce:transition-none"
          style={{ opacity: visible ? 1 : 0 }}
        />
      </svg>
    </div>
  );
}
