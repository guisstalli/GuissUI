'use client';

import { ArrowRight, CalendarCheck, MapPin } from 'lucide-react';
import Link from 'next/link';

import { paths } from '@/config/paths';

import { ChampVisuel } from './champ-visuel';
import { Reveal } from './reveal';

/**
 * Ouverture de la vitrine.
 *
 * Composition ASYMÉTRIQUE (7/5) plutôt que centrée : le texte porte la
 * promesse, le relevé de champ visuel lui répond sans la concurrencer. Un
 * hero centré aurait mis les deux à égalité et dilué la seule chose que le
 * visiteur doit retenir.
 */
export function Hero() {
  return (
    <section
      aria-labelledby="hero-heading"
      className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-8 sm:pb-28 sm:pt-24"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Thiès · Sénégal · UFR Santé — Université Iba Der Thiam
            </p>
          </Reveal>

          <Reveal delay={90}>
            <h1
              id="hero-heading"
              className="mt-5 text-4xl font-bold leading-[1.03] tracking-tight text-slate-900 sm:text-6xl lg:text-[4.25rem]"
            >
              Bien voir n’est pas tout voir.
            </h1>
          </Reveal>

          <Reveal delay={180}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
              <strong className="text-slate-900">10/10 à la vue</strong>{' '}
              n’empêche pas les zones aveugles. Le Centre de Vision Madoune
              Robert Ndiaye les détecte pour vous, vos enfants, et les
              chauffeurs.
            </p>
          </Reveal>

          <Reveal delay={270}>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href={paths.rdv.publicBooking.getHref()}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-cyan-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
              >
                <CalendarCheck className="size-4" aria-hidden />
                Prendre rendez-vous
                <ArrowRight
                  className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
                  aria-hidden
                />
              </Link>
              <Link
                href={paths.events.publicList.getHref()}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-600"
              >
                <MapPin className="size-4" aria-hidden />
                Journées de dépistage
              </Link>
            </div>
          </Reveal>
        </div>

        <div className="lg:col-span-5">
          <ChampVisuel />
        </div>
      </div>
    </section>
  );
}
