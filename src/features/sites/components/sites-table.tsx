'use client';

import { MoreHorizontal, Pencil, Power, RotateCcw, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/ui/can/can';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import {
  TableBody,
  TableCell,
  TableElement as Table,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDebounce } from '@/hooks/use-debounce';

import { useDeleteSite } from '../api/delete-site';
import { useSites } from '../api/get-sites';
import { useHardDeleteSite } from '../api/hard-delete-site';
import { useReactivateSite } from '../api/reactivate-site';
import { Site } from '../types';

import { SiteFormModal } from './site-form-modal';

export const SitesTable = ({ search }: { search: string }) => {
  // La requête API attend 300ms sans frappe (l'input parent reste synchrone)
  const debouncedSearch = useDebounce(search);
  const { data, isLoading, refetch } = useSites({
    params: { search: debouncedSearch || undefined },
  });

  const [siteToEdit, setSiteToEdit] = useState<Site | null>(null);
  const [siteToDeactivate, setSiteToDeactivate] = useState<Site | null>(null);
  const [siteToPurge, setSiteToPurge] = useState<Site | null>(null);
  // Le backend refuse (409) la suppression d'un site référencé et explique
  // pourquoi. On affiche son message plutôt qu'un « échec » opaque.
  const [purgeError, setPurgeError] = useState<string | null>(null);

  const deactivateMutation = useDeleteSite();
  const reactivateMutation = useReactivateSite();
  const purgeMutation = useHardDeleteSite();

  const closePurgeDialog = () => {
    setSiteToPurge(null);
    setPurgeError(null);
  };

  const handleDeactivate = () => {
    if (!siteToDeactivate?.id) return;
    deactivateMutation.mutate(
      { siteId: siteToDeactivate.id },
      {
        onSuccess: () => {
          setSiteToDeactivate(null);
          refetch();
        },
      },
    );
  };

  const handleReactivate = (site: Site) => {
    if (!site.id) return;
    reactivateMutation.mutate(
      { siteId: site.id },
      { onSuccess: () => refetch() },
    );
  };

  const handlePurge = () => {
    if (!siteToPurge?.id) return;
    setPurgeError(null);
    purgeMutation.mutate(
      { siteId: siteToPurge.id },
      {
        onSuccess: () => {
          closePurgeDialog();
          refetch();
        },
        onError: (error) =>
          setPurgeError(
            error instanceof Error ? error.message : 'La suppression a échoué.',
          ),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <p className="text-muted-foreground">Chargement des sites...</p>
      </div>
    );
  }

  const sites = data?.results ?? [];

  return (
    <>
      <div className="rounded-lg border border-border bg-card">
        <Table className="bg-card">
          <TableHeader>
            <TableRow>
              <TableHead>Libellé</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sites.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-muted-foreground"
                >
                  Aucun site trouvé.
                </TableCell>
              </TableRow>
            ) : (
              sites.map((site) => (
                <TableRow key={site.id}>
                  <TableCell className="font-medium">{site.libelle}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {site.code}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {site.adresse || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={site.is_active ? 'secondary' : 'outline'}>
                      {site.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSiteToEdit(site)}>
                          <Pencil className="mr-2 size-4" />
                          Modifier
                        </DropdownMenuItem>
                        {site.is_active ? (
                          <DropdownMenuItem
                            onClick={() => setSiteToDeactivate(site)}
                          >
                            <Power className="mr-2 size-4" />
                            Désactiver
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => handleReactivate(site)}
                            disabled={reactivateMutation.isPending}
                          >
                            <RotateCcw className="mr-2 size-4" />
                            Réactiver
                          </DropdownMenuItem>
                        )}
                        <Can permission="sites:hard-delete">
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              setPurgeError(null);
                              setSiteToPurge(site);
                            }}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 size-4" />
                            Supprimer définitivement
                          </DropdownMenuItem>
                        </Can>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <SiteFormModal
        open={!!siteToEdit}
        onOpenChange={(open) => !open && setSiteToEdit(null)}
        site={siteToEdit}
      />

      <Dialog
        open={!!siteToDeactivate}
        onOpenChange={(open) => !open && setSiteToDeactivate(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Désactiver le site</DialogTitle>
            <DialogDescription>
              <strong>{siteToDeactivate?.libelle}</strong> disparaîtra des
              listes de sélection, mais l&apos;historique des examens qui y sont
              rattachés est conservé. Vous pourrez le réactiver à tout moment
              depuis cette même liste.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSiteToDeactivate(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeactivate}
              disabled={deactivateMutation.isPending}
            >
              {deactivateMutation.isPending ? 'Désactivation...' : 'Désactiver'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!siteToPurge}
        onOpenChange={(open) => !open && closePurgeDialog()}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer définitivement le site</DialogTitle>
            <DialogDescription>
              <strong>{siteToPurge?.libelle}</strong> sera effacé de la base et
              son code <strong>{siteToPurge?.code}</strong> redeviendra
              disponible. Cette action est irréversible. Elle est refusée si un
              examen, un événement ou une facture y fait référence.
            </DialogDescription>
          </DialogHeader>
          {purgeError && (
            <p
              role="alert"
              className="bg-destructive/10 rounded-md px-3 py-2 text-sm text-destructive"
            >
              {purgeError}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closePurgeDialog}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handlePurge}
              disabled={purgeMutation.isPending}
            >
              {purgeMutation.isPending
                ? 'Suppression...'
                : 'Supprimer définitivement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
