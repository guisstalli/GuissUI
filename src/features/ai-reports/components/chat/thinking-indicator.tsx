'use client';

import { Spinner } from '@/components/ui/spinner/spinner';

/**
 * Affiché pendant l'appel ask/ (10-40 s : sélection d'outils, agrégats,
 * vérification d'ancrage). L'appel est perdu si l'utilisateur quitte la page.
 */
export function ThinkingIndicator() {
  return (
    <div
      className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground"
      role="status"
      aria-live="polite"
    >
      <Spinner className="size-4" />
      <span>
        L&apos;assistant analyse les données… (10 à 40 secondes) — ne quittez
        pas cette page.
      </span>
    </div>
  );
}
