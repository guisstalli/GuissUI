'use client';

import { ArrowRight, Truck } from 'lucide-react';
import Link from 'next/link';

import { paths } from '@/config/paths';

import { SECURITE_ROUTIERE } from '../utils/contenu';

import { Reveal } from './reveal';

/**
 * Le programme phare, sur fond sombre.
 *
 * C'est la SEULE inversion de contraste de la page, et elle est là pour ça :
 * après trois écrans clairs, le passage au sombre marque une rupture que
 * l'œil enregistre. En faire une carte de plus dans la grille aurait noyé le
 * seul programme qui distingue ce centre de n'importe quel cabinet.
 */
export function SecuriteRoutiere() {
  return (
    <section
      aria-labelledby="securite-heading"
      className="relative overflow-hidden bg-slate-900 px-4 py-20 sm:px-8 sm:py-28"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 70% 30%, rgba(6,182,212,0.18) 0%, transparent 55%)',
        }}
      />

      <div className="relative mx-auto max-w-5xl">
        <Reveal>
          <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400">
            <Truck className="size-3.5" aria-hidden />
            Depuis le {SECURITE_ROUTIERE.depuis}
          </p>
        </Reveal>

        <Reveal delay={80}>
          <h2
            id="securite-heading"
            className="mt-4 max-w-2xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl"
          >
            {SECURITE_ROUTIERE.intitule}
          </h2>
        </Reveal>

        <Reveal delay={160}>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-slate-300 sm:text-lg">
            {SECURITE_ROUTIERE.promesse} Un dépistage qui vise à réduire les
            accidents de la route au Sénégal, en révélant les atteintes du champ
            visuel qu’aucun contrôle d’acuité ne détecte.
          </p>
        </Reveal>

        <Reveal delay={240}>
          <Link
            href={paths.events.publicList.getHref()}
            className="group mt-9 inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-slate-900 transition hover:bg-cyan-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400"
          >
            Voir les prochaines journées
            <ArrowRight
              className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
              aria-hidden
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
