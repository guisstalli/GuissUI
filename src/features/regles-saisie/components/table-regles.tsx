'use client';

import { AlertTriangle, CheckCircle2, Settings } from 'lucide-react';

import type { RegleSaisie, StatutRegle } from '../api/get-regles';

const PRESENTATION: Record<
  StatutRegle,
  { libelle: string; classe: string; Icone: typeof CheckCircle2 }
> = {
  validee: {
    libelle: 'Validée',
    classe:
      'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100',
    Icone: CheckCircle2,
  },
  a_valider: {
    libelle: 'À valider',
    classe:
      'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100',
    Icone: AlertTriangle,
  },
  produit: {
    libelle: 'Décision produit',
    classe: 'bg-muted text-muted-foreground',
    Icone: Settings,
  },
};

/**
 * Une règle, et ce qui l'autorise.
 *
 * Le 17/09/2026, personne ne pouvait dire d'où venait l'exigence de latéralité
 * qui a refusé 102 enregistrements. Cet écran répond à cette question sans
 * ouvrir le code — c'est sa seule raison d'être.
 */
export function TableRegles({ regles }: { regles: RegleSaisie[] }) {
  if (regles.length === 0) return null;

  return (
    <ul className="space-y-3">
      {regles.map((regle) => {
        const { libelle, classe, Icone } = PRESENTATION[regle.statut];
        return (
          <li key={regle.code} className="rounded-lg border bg-card px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-xs ${classe}`}
              >
                <Icone className="size-3" />
                {libelle}
              </span>
              <span className="text-sm font-medium">{regle.domaine}</span>
              <span className="font-mono text-xs text-muted-foreground">
                {regle.champ}
              </span>
            </div>

            <p className="mt-2 text-sm">{regle.regle}</p>

            <p className="mt-2 text-xs text-muted-foreground">
              {regle.source ? (
                <>
                  Source : {regle.source}
                  {regle.date_validation && ` — ${regle.date_validation}`}
                </>
              ) : (
                // L'absence de source est l'information la plus utile de la
                // ligne : c'est elle qui appelle une décision clinique.
                <>
                  Aucune source clinique : cette règle décide aujourd’hui de ce
                  qu’un opérateur peut enregistrer.
                </>
              )}
            </p>

            {regle.incident && (
              <p className="mt-1 text-xs text-muted-foreground">
                Constaté : {regle.incident}
              </p>
            )}
            <p className="mt-1 break-all font-mono text-[11px] text-muted-foreground">
              {regle.applique_dans}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
