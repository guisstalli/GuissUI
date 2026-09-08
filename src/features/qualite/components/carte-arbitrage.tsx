'use client';

import { Check, Loader2, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';

import { useTrancherArbitrage } from '../api/trancher-arbitrage';
import type { Arbitrage, DecisionArbitrage } from '../types/types';

type CarteArbitrageProps = {
  arbitrage: Arbitrage;
};

const formaterJour = (jour: string) => {
  // `new Date('2026-08-23')` est interprété en UTC : à Dakar, la date reculait
  // d'un jour à l'affichage. On force l'heure locale.
  const [annee, mois, quantieme] = jour.split('-').map(Number);
  return new Date(annee, mois - 1, quantieme).toLocaleDateString('fr-FR');
};

const afficher = (valeur: string) =>
  valeur.trim() === '' ? '— (vide)' : valeur;

const LIBELLE_STATUT: Record<string, string> = {
  conservee: 'Valeur du dossier gardée',
  remplacee: 'Valeur écartée retenue — le dossier a été modifié',
  ignoree: 'Aucune des deux valeurs retenue',
};

/**
 * Deux valeurs concurrentes, côte à côte, et trois boutons.
 *
 * L'écran ne suggère RIEN : il n'y a pas de « recommandé » ici. Le nettoyage a
 * retenu la valeur de gauche parce que son examen était le plus complet — un
 * critère de forme, pas de clinique. Laisser entendre qu'il a raison
 * transformerait un arbitrage médical en simple confirmation, ce qui est
 * exactement le mécanisme qui a produit l'incident.
 */
export function CarteArbitrage({ arbitrage }: CarteArbitrageProps) {
  const [commentaire, setCommentaire] = useState('');
  const trancher = useTrancherArbitrage();
  const enCours = trancher.isPending;
  const tranche = arbitrage.statut !== 'en_attente';

  const decider = (decision: DecisionArbitrage) =>
    trancher.mutate({
      arbitrageId: arbitrage.id,
      decision,
      commentaire,
    });

  return (
    <div className="rounded-lg border bg-card">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b px-4 py-3">
        <div>
          <h3 className="font-semibold">
            {arbitrage.composant_libelle} — {arbitrage.champ_libelle}
          </h3>
          <p className="text-xs text-muted-foreground">
            {arbitrage.patient_nom ?? `Patient ${arbitrage.patient_id}`} ·
            session du {formaterJour(arbitrage.jour)}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Examen conservé #{arbitrage.examen_conserve_id} · écarté{' '}
          {arbitrage.numero_examen_ecarte || `#${arbitrage.examen_ecarte_id}`}
        </p>
      </div>

      <div className="grid gap-px bg-border sm:grid-cols-2">
        <div className="bg-card px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Valeur actuellement au dossier
          </p>
          <p className="mt-1 break-words font-mono text-lg">
            {afficher(arbitrage.valeur_conservee)}
          </p>
        </div>
        <div className="bg-card px-4 py-3">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            Valeur de l’examen supprimé
          </p>
          <p className="mt-1 break-words font-mono text-lg">
            {afficher(arbitrage.valeur_ecartee)}
          </p>
        </div>
      </div>

      {tranche ? (
        <div className="space-y-1 border-t px-4 py-3 text-sm">
          <p className="font-medium">{LIBELLE_STATUT[arbitrage.statut]}</p>
          <p className="text-xs text-muted-foreground">
            {arbitrage.decide_le
              ? new Date(arbitrage.decide_le).toLocaleString('fr-FR')
              : 'date inconnue'}
            {arbitrage.decide_par_email
              ? ` · ${arbitrage.decide_par_email}`
              : ''}
          </p>
          {arbitrage.commentaire ? (
            <p className="text-xs text-muted-foreground">
              « {arbitrage.commentaire} »
            </p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-3 border-t px-4 py-3">
          <label
            htmlFor={`commentaire-${arbitrage.id}`}
            className="block text-xs text-muted-foreground"
          >
            Motif (facultatif, conservé avec la décision)
            <input
              id={`commentaire-${arbitrage.id}`}
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder="ex. mesure refaite en fin de séance"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={enCours}
              onClick={() => decider('conservee')}
            >
              <Check className="mr-1.5 size-3.5" />
              Garder la valeur au dossier
            </Button>
            <Button
              size="sm"
              disabled={enCours}
              onClick={() => decider('remplacee')}
            >
              {enCours ? (
                <Loader2 className="mr-1.5 size-3.5 animate-spin" />
              ) : (
                <Check className="mr-1.5 size-3.5" />
              )}
              Retenir la valeur écartée
            </Button>
            <Button
              size="sm"
              variant="ghost"
              disabled={enCours}
              onClick={() => decider('ignoree')}
            >
              <X className="mr-1.5 size-3.5" />
              Aucune des deux
            </Button>
          </div>

          {/* Dire ce que fait chaque bouton AVANT le clic : « Retenir la valeur
              écartée » est la seule action qui modifie un dossier patient. */}
          <p className="text-xs text-muted-foreground">
            Seul « Retenir la valeur écartée » modifie le dossier. Les deux
            autres actent la décision et retirent la ligne de la file.
          </p>
        </div>
      )}
    </div>
  );
}
