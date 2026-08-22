'use client';

import { EQUIPE, PLATEAU } from '../utils/contenu';

import { Reveal } from './reveal';

/**
 * Plateau technique et équipe, en registre ÉDITORIAL.
 *
 * Listes typographiques plutôt que cartes : neuf appareils en neuf tuiles
 * auraient donné une grille sans hiérarchie, où « OCT » pèse autant que
 * « tableaux d'acuité ». Une liste dense se lit d'un coup d'œil et laisse la
 * place au chiffre qui compte — la taille de l'équipe.
 */
export function PlateauTechnique() {
  return (
    <section
      aria-labelledby="plateau-heading"
      className="px-4 py-20 sm:px-8 sm:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-5">
          <Reveal>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
              Plateau technique
            </p>
            <h2
              id="plateau-heading"
              className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
            >
              Un équipement hospitalier,
              <br />y compris hors les murs.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-slate-600">
              L’unité mobile se déplace avec au moins deux postes de
              consultation, des rétinographes, un MonPack One et des appareils
              portatifs — le même niveau d’examen dans une école ou un Daara
              qu’au centre.
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-7">
          <div className="grid gap-10 sm:grid-cols-2">
            {PLATEAU.map(({ groupe, appareils }, index) => (
              <Reveal key={groupe} delay={index * 120} from="right">
                <h3 className="border-b border-slate-900/10 pb-3 text-sm font-semibold text-slate-900">
                  {groupe}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {appareils.map((appareil) => (
                    <li
                      key={appareil}
                      className="flex gap-3 text-sm leading-relaxed text-slate-600"
                    >
                      <span
                        aria-hidden
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan-500"
                      />
                      {appareil}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </div>

          <Reveal delay={240}>
            <div className="mt-12 border-t border-slate-900/10 pt-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-700">
                Équipe de base
              </p>
              <dl className="mt-5 flex flex-wrap gap-x-10 gap-y-5">
                {EQUIPE.map(({ nombre, role }) => (
                  <div key={role}>
                    <dt className="text-3xl font-bold tabular-nums tracking-tight text-slate-900">
                      {nombre}
                    </dt>
                    <dd className="mt-1 max-w-56 text-sm leading-snug text-slate-600">
                      {role}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
