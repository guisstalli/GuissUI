'use client';

import { RefreshCw } from 'lucide-react';
import { useState } from 'react';

import { AppShell as Shell } from '@/app/_shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form/input';
import { Spinner } from '@/components/ui/spinner';
import { useQualite } from '@/features/qualite/api/get-qualite';
import { CarteAnomalie } from '@/features/qualite/components/carte-anomalie';
import { TableauDoublons } from '@/features/qualite/components/tableau-doublons';
import type { FiltresQualite } from '@/features/qualite/types/types';

/**
 * Écran « Qualité des données ».
 *
 * Né de l'incident du 23/08/2026 : un identifiant de saisie partagé entre tous
 * les opérateurs a produit 114 examens pour 82 patients, et RIEN ne l'a
 * signalé pendant trois semaines. Le temps que cela remonte, les médecins
 * avaient réparti les données entre les doublons et 24 mesures cliniques
 * étaient devenues inarbitrables — deux réfractions concurrentes sur un même
 * patient ne se départagent plus après coup.
 *
 * Cet écran ne fait rien de spectaculaire : il rend visible, le jour même, ce
 * qui n'était visible qu'après coup.
 */
export default function QualiteDonneesPage() {
  const [filtres, setFiltres] = useState<FiltresQualite>({});
  const { data, isLoading, isError, refetch, isFetching } = useQualite(filtres);

  const critiques =
    data?.filter((r) => r.gravite === 'critique' && r.nombre > 0) ?? [];

  return (
    <Shell title="Qualité des données">
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Anomalies de saisie</h2>
            <p className="text-sm text-muted-foreground">
              Détectées sur la période, par ordre de gravité.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-2">
            <label
              htmlFor="qualite-date-debut"
              className="flex flex-col gap-1 text-xs text-muted-foreground"
            >
              Du
              <Input
                id="qualite-date-debut"
                type="date"
                value={filtres.dateDebut ?? ''}
                onChange={(e) =>
                  setFiltres((f) => ({
                    ...f,
                    dateDebut: e.target.value || undefined,
                  }))
                }
              />
            </label>
            <label
              htmlFor="qualite-date-fin"
              className="flex flex-col gap-1 text-xs text-muted-foreground"
            >
              Au
              <Input
                id="qualite-date-fin"
                type="date"
                value={filtres.dateFin ?? ''}
                onChange={(e) =>
                  setFiltres((f) => ({
                    ...f,
                    dateFin: e.target.value || undefined,
                  }))
                }
              />
            </label>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="mr-1.5 size-3.5" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Une bannière seulement s'il y a du critique : sinon l'écran crie
            en permanence et on cesse de le lire. */}
        {critiques.length > 0 && (
          <div className="rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            {critiques.reduce((total, r) => total + r.nombre, 0)} anomalie(s)
            critique(s) : les données cliniques concernées se dispersent entre
            plusieurs examens. Corriger maintenant coûte quelques minutes ;
            attendre rend l’arbitrage impossible.
          </div>
        )}

        {isLoading || isFetching ? (
          <div className="flex justify-center py-16">
            <Spinner />
          </div>
        ) : isError ? (
          <p className="py-16 text-center text-sm text-destructive">
            Impossible de charger la synthèse qualité.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data?.map((regle) => (
              <CarteAnomalie key={regle.code} regle={regle} />
            ))}
          </div>
        )}

        <div className="space-y-3 pt-2">
          <div>
            <h3 className="font-semibold">Patients concernés par un doublon</h3>
            <p className="text-sm text-muted-foreground">
              Un patient, un examen par jour. Chaque ligne est une violation de
              cette règle.
            </p>
          </div>
          <TableauDoublons filtres={filtres} />
        </div>
      </div>
    </Shell>
  );
}
