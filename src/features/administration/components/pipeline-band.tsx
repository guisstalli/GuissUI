import { ArrowRight, Stethoscope } from 'lucide-react';
import Link from 'next/link';

import { useUser } from '@/lib/auth';
import { hasPermission } from '@/lib/authorization';
import { cn } from '@/lib/utils';

import type { AdminDashboardPipeline } from '../types/schemas';

const numberFormatter = new Intl.NumberFormat('fr-FR');

type Segment = {
  key: string;
  label: string;
  value: number;
  /** Le segment critique tranche ; le reste s'efface. */
  bar: string;
  dot: string;
};

function Bar({ segments, total }: { segments: Segment[]; total: number }) {
  if (total === 0) {
    return (
      <div className="h-2.5 w-full rounded-full bg-muted" role="presentation" />
    );
  }
  return (
    <div
      className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted"
      role="presentation"
    >
      {segments
        .filter((segment) => segment.value > 0)
        .map((segment) => (
          <div
            key={segment.key}
            className={cn(segment.bar, 'transition-[width] duration-700')}
            style={{ width: `${(segment.value / total) * 100}%` }}
          />
        ))}
    </div>
  );
}

function Legend({ segments }: { segments: Segment[] }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
      {segments.map((segment) => (
        <li
          key={segment.key}
          className="flex items-center gap-1.5 text-xs text-muted-foreground"
        >
          <span className={cn('size-2 rounded-full', segment.dot)} />
          {segment.label}
          <span className="font-semibold tabular-nums text-foreground">
            {numberFormatter.format(segment.value)}
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Bande d'ouverture du tableau de bord.
 *
 * Elle répond à la seule question qu'un administrateur se pose en arrivant :
 * « est-ce que le travail avance, et qu'est-ce qui bloque ? ». Le chiffre mis
 * en avant n'est donc pas un volume mais les examens dont la partie technique
 * est faite et la partie clinique non — du travail en souffrance chez un
 * médecin, sur lequel on peut agir aujourd'hui.
 *
 * Adultes et enfants sont deux barres distinctes, jamais additionnées : la
 * complétion est dérivée chez l'un, déclarée chez l'autre.
 */
export function PipelineBand({
  pipeline,
  windowDays,
}: {
  pipeline: AdminDashboardPipeline;
  windowDays: number;
}) {
  const { adultes, enfants } = pipeline;
  // Un ADMIN n'a pas `exams:view` et ne peut pas atteindre /exams : le routage
  // le renverrait ici même. Proposer le lien sur SA page d'accueil était donc
  // un appel à l'action mort — constaté en préproduction.
  const { user } = useUser();
  const peutVoirLesExamens = hasPermission(user, 'exams:view');

  const adultSegments: Segment[] = [
    {
      key: 'complets',
      label: 'Complets',
      value: adultes.complets,
      bar: 'bg-emerald-500',
      dot: 'bg-emerald-500',
    },
    {
      key: 'attente',
      label: 'Attente clinique',
      value: adultes.attente_clinique,
      bar: 'bg-amber-500',
      dot: 'bg-amber-500',
    },
    {
      key: 'a_completer',
      label: 'À compléter',
      value: adultes.a_completer,
      bar: 'bg-border',
      dot: 'bg-border',
    },
  ];

  const childSegments: Segment[] = [
    {
      key: 'finalises',
      label: 'Finalisés',
      value: enfants.finalises,
      bar: 'bg-sky-500',
      dot: 'bg-sky-500',
    },
    {
      key: 'en_cours',
      label: 'En cours',
      value: enfants.en_cours,
      bar: 'bg-border',
      dot: 'bg-border',
    },
  ];

  const bloques = adultes.attente_clinique;

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="grid gap-px bg-border lg:grid-cols-[minmax(0,20rem)_1fr]">
        {/* Le chiffre actionnable, isolé : il ne se compare pas aux autres,
            il appelle une décision. */}
        <div className="bg-card p-6">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            <Stethoscope className="size-3.5" aria-hidden="true" />
            En attente de lecture
          </p>
          <p
            className={cn(
              'mt-3 text-6xl font-semibold leading-none tracking-tighter tabular-nums',
              bloques > 0
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-foreground',
            )}
          >
            {numberFormatter.format(bloques)}
          </p>
          <p className="mt-3 text-sm leading-snug text-muted-foreground">
            {bloques === 0
              ? 'Aucun examen adulte en attente de la partie clinique.'
              : `${bloques === 1 ? 'Examen adulte dont' : 'Examens adultes dont'} la partie technique est faite et la partie clinique reste à saisir.`}
          </p>
          {bloques > 0 && peutVoirLesExamens && (
            <Link
              href="/exams"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Voir les examens
              <ArrowRight className="size-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>

        <div className="space-y-6 bg-card p-6">
          <div>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <h3 className="text-sm font-medium text-foreground">
                Examens adultes
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  sur {windowDays} jours
                </span>
              </h3>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {numberFormatter.format(adultes.total)}
              </span>
            </div>
            <Bar segments={adultSegments} total={adultes.total} />
            <Legend segments={adultSegments} />
          </div>

          <div>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <h3 className="text-sm font-medium text-foreground">
                Examens enfants
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  finalisation explicite
                </span>
              </h3>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {numberFormatter.format(enfants.total)}
              </span>
            </div>
            <Bar segments={childSegments} total={enfants.total} />
            <Legend segments={childSegments} />
          </div>
        </div>
      </div>
    </section>
  );
}
