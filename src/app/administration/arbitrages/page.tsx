'use client';

import { useState } from 'react';

import { AppShell as Shell } from '@/app/_shell';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { CapabilityGate } from '@/features/administration/components/capability-gate';
import { useArbitrages } from '@/features/qualite/api/get-arbitrages';
import { CarteArbitrage } from '@/features/qualite/components/carte-arbitrage';
import type { StatutArbitrage } from '@/features/qualite/types/types';
import { CAPABILITY } from '@/lib/capabilities';

const ONGLETS: { statut: StatutArbitrage; libelle: string }[] = [
  { statut: 'en_attente', libelle: 'À trancher' },
  { statut: 'remplacee', libelle: 'Valeur écartée retenue' },
  { statut: 'conservee', libelle: 'Valeur du dossier gardée' },
  { statut: 'ignoree', libelle: 'Écartées' },
];

/**
 * Écran « Valeurs à arbitrer ».
 *
 * Le nettoyage du 23/08/2026 a fusionné 25 champs sans difficulté : un côté
 * vide, l'autre rempli. Pour 24 autres, les deux examens portaient des valeurs
 * DIFFÉRENTES — sphère œil droit +0,500 d'un côté, −0,750 de l'autre :
 * hypermétropie contre myopie. Aucun algorithme ne tranche cela, et une
 * automatisation qui l'aurait fait aurait écrasé sans trace la moitié d'un
 * désaccord clinique réel.
 *
 * Ces valeurs dormaient dans un fichier JSON que personne n'ouvrait. Cet écran
 * leur donne un destinataire.
 */
export default function ArbitragesPage() {
  const [statut, setStatut] = useState<StatutArbitrage>('en_attente');
  const { data, isLoading, isError } = useArbitrages({ statut });

  return (
    <Shell title="Valeurs à arbitrer">
      {/* Le gating du menu ne protège rien : l'URL reste accessible en direct.
          Le serveur refuse (403), mais l'écran afficherait une erreur brute
          plutôt qu'un refus lisible. */}
      <CapabilityGate capability={CAPABILITY.QUALITY_ARBITRATE}>
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold">
              Mesures concurrentes issues d’un nettoyage
            </h2>
            <p className="max-w-3xl text-sm text-muted-foreground">
              Deux examens du même patient portaient, le même jour, des valeurs
              différentes pour la même mesure. Le nettoyage n’en a choisi aucune
              : seule une décision médicale peut trancher.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {ONGLETS.map((onglet) => (
              <Button
                key={onglet.statut}
                size="sm"
                variant={statut === onglet.statut ? 'default' : 'outline'}
                onClick={() => setStatut(onglet.statut)}
              >
                {onglet.libelle}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16">
              <Spinner />
            </div>
          ) : isError ? (
            <p className="py-16 text-center text-sm text-destructive">
              Impossible de charger les valeurs à arbitrer.
            </p>
          ) : !data || data.length === 0 ? (
            <p className="py-16 text-center text-sm text-muted-foreground">
              {statut === 'en_attente'
                ? 'Aucune valeur en attente. Rien ne réclame d’arbitrage.'
                : 'Aucune décision de ce type pour le moment.'}
            </p>
          ) : (
            <div className="space-y-4">
              {data.map((arbitrage) => (
                <CarteArbitrage key={arbitrage.id} arbitrage={arbitrage} />
              ))}
            </div>
          )}
        </div>
      </CapabilityGate>
    </Shell>
  );
}
