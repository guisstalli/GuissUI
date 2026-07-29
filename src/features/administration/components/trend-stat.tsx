import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import type { ComponentType } from 'react';

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const numberFormatter = new Intl.NumberFormat('fr-FR');

type TrendStatProps = {
  label: string;
  value: number;
  /** Même mesure sur la période précédente de même longueur. */
  previous: number;
  /** Libellé de la période comparée, ex. « 14 jours précédents ». */
  periodLabel: string;
  icon?: ComponentType<{ className?: string }>;
  hint?: string;
  /**
   * Sens de lecture de la variation. Faux pour les incidents de sécurité :
   * une hausse y est une mauvaise nouvelle, et la colorer en vert tromperait
   * l'administrateur au moment précis où il doit réagir.
   */
  higherIsBetter?: boolean;
  format?: (value: number) => string;
};

/**
 * Indicateur de FLUX avec son comparateur.
 *
 * Un nombre seul n'est pas interprétable : « 215 exécutions » ne dit ni si
 * c'est normal, ni si quelque chose vient de changer. On affiche donc toujours
 * la variation par rapport à la période précédente de même longueur.
 */
export function TrendStat({
  label,
  value,
  previous,
  periodLabel,
  icon: Icon,
  hint,
  higherIsBetter = true,
  format = (n) => numberFormatter.format(n),
}: TrendStatProps) {
  const delta = value - previous;
  // Une variation en pourcentage n'existe pas depuis zéro : on l'écrit en
  // valeur absolue plutôt que d'afficher un « +100 % » dénué de sens.
  const percent = previous > 0 ? Math.round((delta / previous) * 100) : null;
  const isFlat = delta === 0;
  const isGood = higherIsBetter ? delta > 0 : delta < 0;

  const Arrow = isFlat ? Minus : delta > 0 ? ArrowUp : ArrowDown;
  const toneClass = isFlat
    ? 'text-muted-foreground'
    : isGood
      ? 'text-emerald-600 dark:text-emerald-400'
      : 'text-destructive';

  let comparison: string;
  if (isFlat) {
    comparison = 'stable';
  } else if (percent === null) {
    comparison = `+${format(delta)}`;
  } else {
    comparison = `${delta > 0 ? '+' : '−'}${Math.abs(percent)} %`;
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {Icon && (
            <Icon
              className="size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
          )}
        </div>
        <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">
          {format(value)}
        </p>
        <p className="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs">
          <span
            className={cn(
              'inline-flex items-center gap-0.5 font-medium',
              toneClass,
            )}
          >
            <Arrow className="size-3" aria-hidden="true" />
            {comparison}
          </span>
          <span className="text-muted-foreground">
            vs {periodLabel} ({format(previous)})
          </span>
        </p>
        {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}
