'use client';

import { ShieldCheck } from 'lucide-react';

/**
 * Rappel de confidentialité : l'assistant ne travaille que sur des agrégats
 * anonymisés (tier « aggregate » côté backend) — jamais sur un dossier patient.
 */
export function ChatDisclaimerBanner() {
  return (
    <div className="bg-muted/50 flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground">
      <ShieldCheck className="size-4 shrink-0 text-primary" aria-hidden />
      <p>
        Les réponses sont fondées uniquement sur des{' '}
        <span className="font-medium text-foreground">
          statistiques agrégées et anonymisées
        </span>{' '}
        — jamais sur des données patient individuelles. Chaque réponse est
        vérifiée par rapport aux données réelles avant affichage.
      </p>
    </div>
  );
}
