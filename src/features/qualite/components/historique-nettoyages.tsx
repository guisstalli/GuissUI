'use client';

import { Loader2, Undo2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import {
  TableBody,
  TableCell,
  TableElement,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  useHistoriqueNettoyage,
  useRestaurerNettoyage,
} from '../api/nettoyage';
import type { NettoyageRun } from '../types/types';

const LIBELLE_DECLENCHEUR: Record<NettoyageRun['declencheur'], string> = {
  automatique: 'Tâche de 5 h',
  manuel: 'Lancé ici',
  commande: 'Ligne de commande',
};

const LIBELLE_STATUT: Record<NettoyageRun['statut'], string> = {
  simulation: 'Simulation',
  applique: 'Appliqué',
  restaure: 'Restauré',
  echoue: 'Échoué',
};

const formaterJour = (jour: string | null) => {
  if (!jour) return '—';
  // `new Date('2026-08-23')` est interprété en UTC : à Dakar la date reculait
  // d'un jour à l'affichage.
  const [annee, mois, quantieme] = jour.split('-').map(Number);
  return new Date(annee, mois - 1, quantieme).toLocaleDateString('fr-FR');
};

/**
 * Ce que chaque nettoyage a fait.
 *
 * La tâche de 5 h fusionnait, archivait et supprimait, puis écrivait son
 * rapport dans un fichier sur le serveur et une ligne de journal : personne ne
 * pouvait voir son effet. Une automatisation qu’on ne peut pas inspecter finit
 * par être coupée — et la couper ramènerait à trois semaines de délai de
 * détection.
 */
export function HistoriqueNettoyages() {
  const { data, isLoading, isError } = useHistoriqueNettoyage();
  const restaurer = useRestaurerNettoyage();

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="py-10 text-center text-sm text-destructive">
        Impossible de charger l’historique des nettoyages.
      </p>
    );
  }

  if (!data || data.length === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Aucun nettoyage exécuté à ce jour.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <TableElement>
        <TableHeader>
          <TableRow>
            <TableHead>Journée</TableHead>
            <TableHead>Déclenché par</TableHead>
            <TableHead className="text-right">Fusions</TableHead>
            <TableHead className="text-right">Supprimés</TableHead>
            <TableHead className="text-right">À arbitrer</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((run) => (
            <TableRow key={run.id}>
              <TableCell className="font-medium">
                {formaterJour(run.jour)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {LIBELLE_DECLENCHEUR[run.declencheur]}
                {run.lance_par_email ? ` · ${run.lance_par_email}` : ''}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {run.fusions}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {run.supprimes}
              </TableCell>
              <TableCell className="text-right font-mono tabular-nums">
                {run.arbitrages_crees}
              </TableCell>
              <TableCell className="text-sm">
                {LIBELLE_STATUT[run.statut]}
                {run.restaure_le ? (
                  <span className="block text-xs text-muted-foreground">
                    {new Date(run.restaure_le).toLocaleDateString('fr-FR')}
                  </span>
                ) : null}
              </TableCell>
              <TableCell className="text-right">
                {run.est_restaurable ? (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={restaurer.isPending}
                    onClick={() => restaurer.mutate(run.id)}
                  >
                    {restaurer.isPending ? (
                      <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                    ) : (
                      <Undo2 className="mr-1.5 size-3.5" />
                    )}
                    Restaurer
                  </Button>
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </TableElement>
    </div>
  );
}
