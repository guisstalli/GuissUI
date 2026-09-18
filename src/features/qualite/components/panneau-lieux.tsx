'use client';

import { Loader2, MapPin, Merge } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/dialog/confirmation-dialog/confirmation-dialog';

import {
  useFusionnerSites,
  useRattacherSites,
  useSitesDoublons,
} from '../api/sites';
import type { RattachementSites } from '../types/types';

/**
 * Les lieux : rattacher les patients, réunir les doubles.
 *
 * Le site n'existait que sur l'examen. Dans le dump du 18/09/2026, 3 441
 * patients n'en portaient aucun et 246 n'ont aucun examen : on ne pouvait pas
 * revenir vers les personnes d'un établissement — convoquer les enfants à
 * revoir d'une école, mesurer la couverture d'une campagne.
 *
 * Deux temps ici aussi : le rattrapage annonce d'abord ce qu'il ferait. Un
 * patient examiné sur deux sites n'est jamais deviné ; il est compté à part.
 */
export function PanneauLieux() {
  const [plan, setPlan] = useState<RattachementSites | null>(null);

  const rattacher = useRattacherSites({
    onSuccess: (resultat) => setPlan(resultat.applique ? null : resultat),
  });
  const fusionner = useFusionnerSites();
  const { data: doublons } = useSitesDoublons();

  return (
    <div className="rounded-lg border bg-card">
      <div className="border-b px-4 py-3">
        <h3 className="font-semibold">Lieux de dépistage</h3>
        <p className="text-sm text-muted-foreground">
          Le site n’existait que sur l’examen : un patient sans examen n’était
          rattaché à rien, et deux écritures d’un même nom comptaient comme deux
          établissements.
        </p>
      </div>

      <div className="space-y-3 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={rattacher.isPending}
            onClick={() => rattacher.mutate(false)}
          >
            {rattacher.isPending ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <MapPin className="mr-1.5 size-3.5" />
            )}
            Analyser les rattachements
          </Button>
          <span className="text-xs text-muted-foreground">
            Déduit le lieu des examens déjà saisis, sans rien écrire.
          </span>
        </div>

        {plan && (
          <div className="rounded-md border bg-muted/30 px-3 py-2 text-sm">
            <ul className="grid gap-1 text-muted-foreground sm:grid-cols-2">
              <li>
                <b className="font-mono text-foreground">{plan.rattaches}</b>{' '}
                patient(s) seront rattaché(s) à leur site
              </li>
              <li>
                <b className="font-mono text-foreground">{plan.ambigus}</b>{' '}
                examiné(s) sur plusieurs sites — laissé(s) tels quels
              </li>
              <li>
                <b className="font-mono text-foreground">{plan.sans_examen}</b>{' '}
                sans aucun examen : rien à déduire
              </li>
              <li>
                <b className="font-mono text-foreground">
                  {plan.deja_rattaches}
                </b>{' '}
                portent déjà un lieu — la déduction ne les touche pas
              </li>
            </ul>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                size="sm"
                disabled={rattacher.isPending || plan.rattaches === 0}
                onClick={() => rattacher.mutate(true)}
              >
                Rattacher ces patients
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setPlan(null)}
                disabled={rattacher.isPending}
              >
                Annuler
              </Button>
            </div>
          </div>
        )}

        {doublons && doublons.length > 0 && (
          <div className="space-y-2 border-t pt-3">
            <p className="text-sm font-medium">
              Lieux qui semblent être le même écrit deux fois
            </p>
            <p className="text-xs text-muted-foreground">
              Rien n’est réuni d’office : deux lieux peuvent légitimement porter
              des noms proches. Choisissez celui qui reste.
            </p>
            {doublons.map((groupe) => (
              <div
                key={groupe.cle}
                className="flex flex-wrap items-center gap-2 rounded-md border px-3 py-2 text-sm"
              >
                {groupe.sites.map((site) => (
                  <ConfirmationDialog
                    key={site.id}
                    icon="danger"
                    title={`Tout réunir sous « ${site.libelle} » ?`}
                    body={
                      `Les examens et les patients des autres écritures seront ` +
                      `repointés sur ce site. Les doubles sont désactivés, pas ` +
                      `supprimés : leur code figure dans des exports déjà transmis.`
                    }
                    cancelButtonText="Annuler"
                    isDone={fusionner.isSuccess}
                    triggerButton={
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={fusionner.isPending}
                      >
                        <Merge className="mr-1.5 size-3.5" />
                        Garder « {site.libelle} »
                      </Button>
                    }
                    confirmButton={
                      <Button
                        disabled={fusionner.isPending}
                        onClick={() =>
                          fusionner.mutate({
                            garde: site.id,
                            doublons: groupe.sites
                              .filter((autre) => autre.id !== site.id)
                              .map((autre) => autre.id),
                          })
                        }
                      >
                        {fusionner.isPending ? (
                          <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                        ) : null}
                        Oui, réunir
                      </Button>
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
