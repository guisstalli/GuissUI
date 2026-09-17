'use client';

import { Check, Loader2 } from 'lucide-react';

/** Une étape du raisonnement, telle que le serveur l'émet pendant la réponse. */
export type EtapeProgression = {
  index: number;
  outils: string[];
  terminee: boolean;
};

/**
 * Déroulé du raisonnement PENDANT la réponse.
 *
 * Le serveur émettait déjà ses étapes (`step`, `tools`), mais l'interface les
 * écrasait dans une seule ligne de statut : après quarante secondes d'attente,
 * l'utilisateur n'avait vu qu'un « L'assistant réfléchit… » immobile, sans
 * savoir si quelque chose avançait. On garde la trace de chaque étape, et on
 * montre ce qui a été consulté.
 *
 * Le TEXTE de la réponse n'est volontairement pas diffusé au fil de l'eau : il
 * n'est publiable qu'une fois la vérification d'ancrage des chiffres passée.
 */
export function ChatProgress({ etapes }: { etapes: EtapeProgression[] }) {
  if (etapes.length === 0) return null;

  return (
    <ol className="space-y-1" aria-label="Déroulé de la réponse">
      {etapes.map((etape) => (
        <li
          key={etape.index}
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          {etape.terminee ? (
            <Check className="size-3 text-emerald-600" aria-hidden />
          ) : (
            <Loader2 className="size-3 animate-spin" aria-hidden />
          )}
          <span>
            Étape {etape.index + 1}
            {etape.outils.length > 0 && ` — ${etape.outils.join(', ')}`}
          </span>
        </li>
      ))}
    </ol>
  );
}
