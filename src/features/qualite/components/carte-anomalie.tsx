'use client';

import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';

import { cn } from '@/utils/cn';

import type { Gravite, RegleQualite } from '../types/types';

const APPARENCE: Record<
  Gravite,
  { bordure: string; texte: string; fond: string; Icone: typeof AlertTriangle }
> = {
  critique: {
    bordure: 'border-destructive/40',
    texte: 'text-destructive',
    fond: 'bg-destructive/5',
    Icone: AlertTriangle,
  },
  majeure: {
    bordure: 'border-amber-500/40',
    texte: 'text-amber-600 dark:text-amber-400',
    fond: 'bg-amber-500/5',
    Icone: AlertTriangle,
  },
  mineure: {
    bordure: 'border-border',
    texte: 'text-muted-foreground',
    fond: 'bg-muted/30',
    Icone: Info,
  },
};

type CarteAnomalieProps = {
  regle: RegleQualite;
  onOuvrir?: (code: string) => void;
};

/**
 * Une anomalie de saisie, avec son nombre et ce qu'elle implique.
 *
 * Le compte seul ne dit rien : « 15 » n'alarme personne. C'est l'explication
 * — « les données cliniques se dispersent entre les doublons » — qui fait
 * comprendre pourquoi il faut agir le jour même plutôt que dans trois semaines.
 */
export function CarteAnomalie({ regle, onOuvrir }: CarteAnomalieProps) {
  const sain = regle.nombre === 0;
  const { bordure, texte, fond, Icone } = APPARENCE[regle.gravite];
  const cliquable = !sain && onOuvrir !== undefined;

  return (
    <button
      type="button"
      disabled={!cliquable}
      onClick={cliquable ? () => onOuvrir(regle.code) : undefined}
      className={cn(
        'flex w-full flex-col gap-2 rounded-lg border p-4 text-left transition-colors',
        sain ? 'border-border bg-card' : cn(bordure, fond),
        cliquable &&
          'hover:bg-accent/40 focus-visible:ring-2 focus-visible:ring-ring',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-medium leading-snug">
          {regle.libelle}
        </span>
        {sain ? (
          <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
        ) : (
          <Icone className={cn('size-4 shrink-0', texte)} />
        )}
      </div>

      <span
        className={cn(
          'text-3xl font-semibold tabular-nums',
          sain ? 'text-muted-foreground' : texte,
        )}
      >
        {regle.nombre}
      </span>

      <span className="text-xs leading-relaxed text-muted-foreground">
        {sain ? 'Aucune anomalie détectée.' : regle.explication}
      </span>

      {/* La ventilation décide de l'action, pas seulement de l'ampleur : une
          anomalie saisie dans l'application se corrige (l'opérateur est
          identifiable, le patient joignable), une anomalie héritée de
          l'ancienne plateforme souvent pas. Affichée seulement quand une part
          vient de l'import — sinon c'est du bruit. */}
      {!sain && regle.importes !== undefined && regle.importes > 0 && (
        <span className="text-xs text-muted-foreground">
          dont{' '}
          <strong className="font-medium text-foreground">
            {regle.importes}
          </strong>{' '}
          héritée(s) de l’ancienne plateforme
          {regle.saisis ? ` · ${regle.saisis} saisie(s) ici` : ''}
        </span>
      )}
    </button>
  );
}
