'use client';

import { Loader2, PlayCircle } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form/input';

import { useAppliquerNettoyage, useSimulerNettoyage } from '../api/nettoyage';
import { jourLocal, type PlanNettoyage } from '../types/types';

const hier = () => jourLocal(-1);

/**
 * Nettoyer une journée depuis l'écran.
 *
 * Jusqu'ici cette opération supposait d'ouvrir un terminal sur le serveur :
 * l'écran signalait quinze doublons et laissait l'utilisateur devant une ligne
 * de commande.
 *
 * Deux temps, jamais un seul : la simulation annonce ce qui sera fusionné,
 * supprimé et mis en arbitrage ; l'application ne s'exécute qu'ensuite.
 * Confirmer une suppression sans en connaître la portée n'est pas confirmer.
 */
export function PanneauNettoyage() {
  const [jour, setJour] = useState(hier);
  const [plan, setPlan] = useState<PlanNettoyage | null>(null);

  const simuler = useSimulerNettoyage();
  const appliquer = useAppliquerNettoyage({ onSuccess: () => setPlan(null) });
  const enCours = simuler.isPending || appliquer.isPending;

  const lancerSimulation = () =>
    simuler.mutate(jour, { onSuccess: (resultat) => setPlan(resultat) });

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <h3 className="font-semibold">Nettoyer une journée</h3>
        <p className="text-sm text-muted-foreground">
          Fusionne ce qui ne se contredit pas, archive avant de supprimer, et
          crée un arbitrage pour chaque valeur concurrente — il n’en tranche
          jamais aucune.
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-2 px-4 py-3">
        <label
          htmlFor="nettoyage-jour"
          className="flex flex-col gap-1 text-xs text-muted-foreground"
        >
          Journée
          <Input
            id="nettoyage-jour"
            type="date"
            value={jour}
            onChange={(e) => {
              setJour(e.target.value);
              setPlan(null);
            }}
          />
        </label>
        <Button
          variant="outline"
          size="sm"
          disabled={enCours || !jour}
          onClick={lancerSimulation}
        >
          {simuler.isPending ? (
            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
          ) : (
            <PlayCircle className="mr-1.5 size-3.5" />
          )}
          Analyser cette journée
        </Button>
      </div>

      {plan && (
        <div className="border-t px-4 py-3">
          {plan.supprimes === 0 ? (
            <p className="text-sm text-muted-foreground">
              Rien à nettoyer ce jour-là : {plan.examens_concernes} examen(s)
              pour {plan.patients} patient(s), aucun doublon.
            </p>
          ) : (
            <>
              <p className="text-sm font-medium">Ce qui sera fait</p>
              <ul className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                <li>
                  <b className="font-mono text-foreground">{plan.fusions}</b>{' '}
                  champ(s) recollé(s) sur l’examen conservé
                </li>
                <li>
                  <b className="font-mono text-foreground">{plan.supprimes}</b>{' '}
                  examen(s) archivé(s) puis supprimé(s)
                </li>
                <li>
                  <b className="font-mono text-foreground">{plan.conflits}</b>{' '}
                  valeur(s) concurrente(s) mise(s) en arbitrage
                </li>
                <li>
                  <b className="font-mono text-foreground">
                    {plan.reprises_epargnees}
                  </b>{' '}
                  reprise(s) déclarée(s) épargnée(s)
                </li>
              </ul>

              {plan.conflits > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Les valeurs concurrentes ne sont jamais tranchées
                  automatiquement : elles partent vers l’écran d’arbitrage et
                  les médecins sont prévenus.
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  disabled={enCours}
                  onClick={() => appliquer.mutate(jour)}
                >
                  {appliquer.isPending && (
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  )}
                  Appliquer le nettoyage
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={enCours}
                  onClick={() => setPlan(null)}
                >
                  Annuler
                </Button>
                <span className="text-xs text-muted-foreground">
                  Réversible : l’archive est écrite avant toute suppression.
                </span>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
