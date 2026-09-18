'use client';

import { AlertTriangle } from 'lucide-react';

import { useCompletude } from '../api/campagne';
import type { Campagne } from '../types/types';

interface BilanCampagneProps {
  campagne: Campagne;
}

/**
 * Ce que la campagne a réellement mesuré.
 *
 * Deux chiffres manquaient partout. D'abord le dénominateur réel : le
 * 17/09/2026, 98 des 189 examens enfant ne portaient aucune mesure et
 * comptaient pourtant comme réalisés. Ensuite le seuil à partir duquel un taux
 * veut dire quelque chose : le rapport de la Gare Routière de Thiès concluait
 * sur des sous-groupes de quelques personnes, où « 16,7 % » désigne une
 * personne sur six.
 */
export function BilanCampagne({ campagne }: BilanCampagneProps) {
  const { data } = useCompletude({
    siteId: campagne.siteId,
    eventId: campagne.eventId,
  });

  if (!data) return null;

  return (
    <div className="rounded-lg border bg-card px-4 py-3">
      <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 text-sm">
        <span>
          <b className="font-mono text-base">{data.passages}</b> passage(s)
          <span className="text-muted-foreground">
            {' '}
            ({data.adultes} adulte(s), {data.enfants} enfant(s))
          </span>
        </span>
        <span>
          <b className="font-mono text-base">{data.avec_mesure}</b> avec au
          moins une mesure
          <span className="text-muted-foreground"> ({data.taux_mesure} %)</span>
        </span>
        <span>
          <b className="font-mono text-base">{data.complets}</b> conclu(s)
          <span className="text-muted-foreground">
            {' '}
            ({data.taux_complet} %)
          </span>
        </span>
      </div>

      {data.sans_mesure > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          {data.sans_mesure} dossier(s) ouvert(s) sans aucune mesure — ils
          comptent aujourd’hui comme des examens réalisés dans tous les
          rapports.
        </p>
      )}

      {/* Le rapport du 23/08 tirait des conclusions sur six personnes. Le
          signaler ICI, pendant la campagne, laisse encore le temps d'en voir
          davantage. */}
      {!data.effectif_interpretable && data.passages > 0 && (
        <p className="mt-2 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-2 py-1.5 text-xs dark:border-amber-800 dark:bg-amber-950/30">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          <span>
            Moins de {data.seuil_interpretation} examens mesurés : les
            proportions calculées sur cette campagne ne sont pas interprétables
            — une part sur un si petit effectif est une liste, pas un taux.
          </span>
        </p>
      )}
    </div>
  );
}
