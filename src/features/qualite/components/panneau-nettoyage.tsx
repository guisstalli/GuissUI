'use client';

import { Loader2, PlayCircle } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form/input';
import { cn } from '@/utils/cn';

import { useAppliquerNettoyage, useSimulerNettoyage } from '../api/nettoyage';
import {
  jourLocal,
  type OperationNettoyage,
  type PlanNettoyage,
} from '../types/types';

const hier = () => jourLocal(-1);

/**
 * Les deux nettoyages que l'écran sait piloter.
 *
 * L'adulte était seul servi : la campagne scolaire du 17/09/2026 — 98 examens
 * enfant vides sur 189 — ne déclenchait rien ici, alors qu'elle gonflait les
 * effectifs de tous les rapports.
 */
const OPERATIONS: {
  code: OperationNettoyage;
  onglet: string;
  titre: string;
  explication: string;
}[] = [
  {
    code: 'doublons',
    onglet: 'Doublons (adulte)',
    titre: 'Nettoyer une journée',
    explication:
      'Fusionne ce qui ne se contredit pas, archive avant de supprimer, et ' +
      'crée un arbitrage pour chaque valeur concurrente — il n’en tranche ' +
      'jamais aucune.',
  },
  {
    code: 'coquilles_enfant',
    onglet: 'Examens enfant vides',
    titre: 'Purger les examens enfant restés vides',
    explication:
      'Supprime les examens enfant ouverts puis jamais remplis — aucune ' +
      'acuité mesurée. Ils comptent aujourd’hui comme des examens réalisés. ' +
      'Archivés avant suppression, donc restaurables.',
  },
];

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
  const [operation, setOperation] = useState<OperationNettoyage>('doublons');
  const [plan, setPlan] = useState<PlanNettoyage | null>(null);

  const simuler = useSimulerNettoyage();
  const appliquer = useAppliquerNettoyage({ onSuccess: () => setPlan(null) });
  const enCours = simuler.isPending || appliquer.isPending;
  const active = OPERATIONS.find((o) => o.code === operation) ?? OPERATIONS[0];
  const estEnfant = operation === 'coquilles_enfant';

  const lancerSimulation = () =>
    simuler.mutate(
      { jour, operation },
      { onSuccess: (resultat) => setPlan(resultat) },
    );

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <h3 className="font-semibold">{active.titre}</h3>
        <p className="text-sm text-muted-foreground">{active.explication}</p>
      </div>

      <div
        role="tablist"
        aria-label="Nature du nettoyage"
        className="flex gap-1 border-b px-4 py-2"
      >
        {OPERATIONS.map((choix) => (
          <button
            key={choix.code}
            type="button"
            role="tab"
            aria-selected={choix.code === operation}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm transition-colors',
              choix.code === operation
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted',
            )}
            onClick={() => {
              setOperation(choix.code);
              // Un plan calculé pour une autre opération n'a plus de sens :
              // le garder afficherait un bouton « Appliquer » trompeur.
              setPlan(null);
            }}
          >
            {choix.onglet}
          </button>
        ))}
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
              {estEnfant
                ? ', tous porteurs d’au moins une mesure.'
                : ` pour ${plan.patients} patient(s), aucun doublon.`}
            </p>
          ) : (
            <>
              <p className="text-sm font-medium">Ce qui sera fait</p>
              <ul className="mt-2 grid gap-1 text-sm text-muted-foreground sm:grid-cols-2">
                {estEnfant ? (
                  <>
                    <li>
                      <b className="font-mono text-foreground">
                        {plan.supprimes}
                      </b>{' '}
                      examen(s) enfant sans aucune mesure, archivé(s) puis
                      supprimé(s)
                    </li>
                    <li>
                      sur{' '}
                      <b className="font-mono text-foreground">
                        {plan.examens_concernes}
                      </b>{' '}
                      examen(s) enfant ce jour-là
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <b className="font-mono text-foreground">
                        {plan.fusions}
                      </b>{' '}
                      champ(s) recollé(s) sur l’examen conservé
                    </li>
                    <li>
                      <b className="font-mono text-foreground">
                        {plan.supprimes}
                      </b>{' '}
                      examen(s) archivé(s) puis supprimé(s)
                    </li>
                    <li>
                      <b className="font-mono text-foreground">
                        {plan.conflits}
                      </b>{' '}
                      valeur(s) concurrente(s) mise(s) en arbitrage
                    </li>
                    <li>
                      <b className="font-mono text-foreground">
                        {plan.reprises_epargnees}
                      </b>{' '}
                      reprise(s) déclarée(s) épargnée(s)
                    </li>
                  </>
                )}
              </ul>

              {!estEnfant && (plan.conflits ?? 0) > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Les valeurs concurrentes ne sont jamais tranchées
                  automatiquement : elles partent vers l’écran d’arbitrage et
                  les médecins sont prévenus.
                </p>
              )}

              {estEnfant && plan.numeros && plan.numeros.length > 0 && (
                <p className="mt-2 break-all font-mono text-xs text-muted-foreground">
                  {plan.numeros.join(' · ')}
                  {plan.numeros.length < plan.supprimes && ' …'}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  size="sm"
                  disabled={enCours}
                  onClick={() => appliquer.mutate({ jour, operation })}
                >
                  {appliquer.isPending && (
                    <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  )}
                  {estEnfant ? 'Appliquer la purge' : 'Appliquer le nettoyage'}
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
