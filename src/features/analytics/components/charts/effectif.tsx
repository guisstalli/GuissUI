import { cn } from '@/lib/utils';

// Sous ce nombre de cas, l'écran signale « effectif faible » (C11, Kamal 11/10) :
// « 100 % » sur 1 œil ne se lit pas comme « 100 % » sur 500.
export const SMALL_SAMPLE_THRESHOLD = 10;

type EffectifProps = {
  /** Nombre de cas du pourcentage ; absent, seul le total est affiché. */
  count?: number;
  total: number;
  /** Unité au singulier (« œil », « patient », « examen »). */
  unit: string;
  /** Unité au pluriel quand elle ne prend pas simplement un « s ». */
  unitPlural?: string;
  className?: string;
};

/**
 * Effectif affiché à côté d'un pourcentage : « (3 yeux sur 24) », et la mention
 * « effectif faible » sous 10 cas.
 */
export const Effectif = ({
  count,
  total,
  unit,
  unitPlural,
  className,
}: EffectifProps) => {
  const pluriel = unitPlural ?? `${unit}s`;
  const libelle = (n: number) => (n > 1 ? pluriel : unit);
  const texte =
    count == null
      ? `sur ${total} ${libelle(total)}`
      : `${count} ${libelle(count)} sur ${total}`;

  return (
    <span className={cn('text-xs text-muted-foreground', className)}>
      ({texte})
      {total < SMALL_SAMPLE_THRESHOLD && (
        <span className="ml-1 font-medium text-amber-600 dark:text-amber-400">
          effectif faible
        </span>
      )}
    </span>
  );
};
