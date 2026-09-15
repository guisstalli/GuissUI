'use client';

import { RefreshCw, Scale } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { AppShell as Shell } from '@/app/_shell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form/input';
import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';
import { useQualite } from '@/features/qualite/api/get-qualite';
import { CarteAnomalie } from '@/features/qualite/components/carte-anomalie';
import { CourbeTendance } from '@/features/qualite/components/courbe-tendance';
import { HistoriqueNettoyages } from '@/features/qualite/components/historique-nettoyages';
import { PanneauNettoyage } from '@/features/qualite/components/panneau-nettoyage';
import { TableauDoublons } from '@/features/qualite/components/tableau-doublons';
import {
  jourLocal,
  type FiltresQualite,
  type RegleQualite,
} from '@/features/qualite/types/types';
import {
  CAPABILITY,
  hasCapability,
  useMyCapabilities,
} from '@/lib/capabilities';

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
function SectionRegles({
  titre,
  description,
  regles,
}: {
  titre: string;
  description: string;
  regles: RegleQualite[];
}) {
  if (regles.length === 0) return null;

  return (
    <section className="space-y-3">
      <div>
        <h3 className="font-semibold">{titre}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {regles.map((regle) => (
          <CarteAnomalie key={regle.code} regle={regle} />
        ))}
      </div>
    </section>
  );
}

/** Fenêtre par défaut de la courbe : assez large pour qu'un pic ressorte. */
const JOURS_TENDANCE = 60;

export default function QualiteDonneesPage() {
  const [filtres, setFiltres] = useState<FiltresQualite>({});
  // Le lien vers l'arbitrage suit la même capacité que l'entrée de menu :
  // proposer une action que le serveur refusera n'aide personne.
  const { data: capacites } = useMyCapabilities();
  const peutArbitrer = hasCapability(capacites, CAPABILITY.QUALITY_ARBITRATE);
  const { data, isLoading, isError, refetch, isFetching } = useQualite(filtres);

  const critiques =
    data?.filter((r) => r.gravite === 'critique' && r.nombre > 0) ?? [];

  // La courbe suit les filtres quand ils existent ; sinon elle regarde en
  // arrière d'elle-même — un écran de surveillance qui démarre vide ne
  // surveille rien.
  const dateDebut = filtres.dateDebut ?? jourLocal(-JOURS_TENDANCE);
  const dateFin = filtres.dateFin ?? jourLocal();

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
            {/* Le nettoyage résout ce qui ne se contredit pas ; le reste
                attend un médecin. Sans ce lien, cette file n'a pas de porte
                d'entrée depuis l'écran où l'on constate le problème.

                Gaté sur la même capacité que l'entrée de menu : proposer une
                action que le serveur refusera n'aide personne. */}
            {peutArbitrer && (
              <Button variant="outline" size="sm" asChild>
                <Link href={paths.administration.arbitrations.getHref()}>
                  <Scale className="mr-1.5 size-3.5" />
                  Valeurs à arbitrer
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Une bannière seulement s'il y a du critique : sinon l'écran crie
            en permanence et on cesse de le lire. */}
        {critiques.length > 0 && (
          <div className="border-destructive/40 bg-destructive/5 rounded-lg border px-4 py-3 text-sm text-destructive">
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
          <div className="space-y-6">
            {/* Deux familles séparées : la saisie d'une séance se corrige le
                soir même par l'opérateur ; une fiche incohérente se corrige
                dossier par dossier, parfois jamais quand elle vient de
                l'ancienne plateforme. Les mélanger produisait une grille où
                l'urgent et l'irréparable se ressemblaient. */}
            <SectionRegles
              titre="Saisie des examens"
              description="Anomalies de la période sélectionnée."
              regles={data?.filter((r) => r.famille === 'examens') ?? []}
            />
            <SectionRegles
              titre="Cohérence des dossiers"
              description="Patients et conducteurs — indépendant de la période."
              regles={data?.filter((r) => r.famille === 'dossiers') ?? []}
            />
          </div>
        )}

        <CourbeTendance dateDebut={dateDebut} dateFin={dateFin} />

        {/* Voir une anomalie sans pouvoir agir dessus obligeait à ouvrir un
            terminal sur le serveur. */}
        <PanneauNettoyage />

        <div className="space-y-3 pt-2">
          <div>
            <h3 className="font-semibold">Nettoyages effectués</h3>
            <p className="text-sm text-muted-foreground">
              Ce que chaque exécution a fait, la tâche de 5&nbsp;h comprise — et
              de quoi la défaire.
            </p>
          </div>
          <HistoriqueNettoyages />
        </div>

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
