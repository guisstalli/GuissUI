'use client';

import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

import { useDeleteSite, useSites } from '../api';
import { Site } from '../types';

import { SiteFormModal } from './site-form-modal';

export const SitesTable = ({ search }: { search: string }) => {
  const { data, isLoading, refetch } = useSites({
    params: { search: search || undefined },
  });
  const deleteSiteMutation = useDeleteSite();

  const [siteToEdit, setSiteToEdit] = useState<Site | null>(null);
  const [siteToDelete, setSiteToDelete] = useState<Site | null>(null);

  const handleDelete = () => {
    if (siteToDelete?.id) {
      deleteSiteMutation.mutate(
        { siteId: siteToDelete.id },
        {
          onSuccess: () => {
            setSiteToDelete(null);
            refetch();
          },
        },
      );
    }
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
        <Table>
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
                        <DropdownMenuItem
                          onClick={() => setSiteToDelete(site)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 size-4" />
                          Supprimer
                        </DropdownMenuItem>
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
        open={!!siteToDelete}
        onOpenChange={(open) => !open && setSiteToDelete(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer le site</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le site{' '}
              <strong>{siteToDelete?.libelle}</strong> ? Cette action peut être
              annulée plus tard dans l&apos;administration.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSiteToDelete(null)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteSiteMutation.isPending}
            >
              {deleteSiteMutation.isPending ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
