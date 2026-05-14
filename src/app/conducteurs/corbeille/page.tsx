'use client';

import dayjs from 'dayjs';
import { ArchiveRestore, Loader2, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { AppShell as Shell } from '@/app/_shell';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/ui/can/can';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import { Spinner } from '@/components/ui/spinner';
import {
  TableBody,
  TableCell,
  TableElement,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useDeletedDrivers } from '@/features/drivers/api/get-deleted-drivers';
import { useHardDeleteDriver } from '@/features/drivers/api/hard-delete-driver';
import { useRestoreDriver } from '@/features/drivers/api/restore-driver';
import type { Driver } from '@/features/drivers/types/schemas';
import { useDialogCleanup } from '@/hooks/use-dialog-cleanup';

export default function CorbeilleDriverPage() {
  const { data, isLoading } = useDeletedDrivers();
  const [driverToRestore, setDriverToRestore] = useState<Driver | null>(null);
  const [driverToHardDelete, setDriverToHardDelete] = useState<Driver | null>(
    null,
  );

  useDialogCleanup([!!driverToRestore, !!driverToHardDelete]);

  const restoreMutation = useRestoreDriver({
    mutationConfig: { onSuccess: () => setDriverToRestore(null) },
  });

  const hardDeleteMutation = useHardDeleteDriver({
    mutationConfig: { onSuccess: () => setDriverToHardDelete(null) },
  });

  const drivers: Driver[] = data?.results ?? [];

  return (
    <Shell title="Corbeille des conducteurs">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Conducteurs supprimés</h2>
            <p className="text-sm text-muted-foreground">
              Les conducteurs en corbeille peuvent être restaurés ou supprimés
              définitivement.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        ) : drivers.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <Trash2 className="text-muted-foreground/40 mb-3 size-10" />
            <p className="font-medium text-muted-foreground">
              La corbeille est vide
            </p>
            <p className="text-muted-foreground/70 mt-1 text-sm">
              Les conducteurs supprimés apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border">
            <TableElement>
              <TableHeader>
                <TableRow>
                  <TableHead>Conducteur</TableHead>
                  <TableHead>N° Permis</TableHead>
                  <TableHead>Type permis</TableHead>
                  <TableHead>Secteur</TableHead>
                  <TableHead>Supprimé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {drivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell className="font-medium">
                      <div>{driver.patient.full_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {driver.patient.numero_identifiant}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {driver.numero_permis}
                    </TableCell>
                    <TableCell>{driver.type_permis}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {driver.service}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {driver.deleted_at
                        ? dayjs(driver.deleted_at).format('DD/MM/YYYY HH:mm')
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Can permission="patients:restore">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDriverToRestore(driver)}
                          >
                            <ArchiveRestore className="mr-1.5 size-3.5" />
                            Restaurer
                          </Button>
                        </Can>
                        <Can permission="patients:hard-delete">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDriverToHardDelete(driver)}
                          >
                            <Trash2 className="mr-1.5 size-3.5" />
                            Supprimer
                          </Button>
                        </Can>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableElement>
          </div>
        )}
      </div>

      {/* Restore confirmation */}
      <Dialog
        open={!!driverToRestore}
        onOpenChange={(open) => {
          if (!open) setDriverToRestore(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurer le conducteur</DialogTitle>
            <DialogDescription>
              Voulez-vous restaurer{' '}
              <span className="font-semibold">
                {driverToRestore?.patient.full_name}
              </span>{' '}
              ? Il redeviendra visible dans la liste des conducteurs.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDriverToRestore(null)}>
              Annuler
            </Button>
            <Button
              onClick={() =>
                driverToRestore && restoreMutation.mutate(driverToRestore.id)
              }
              disabled={restoreMutation.isPending}
            >
              {restoreMutation.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Restaurer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Hard delete confirmation */}
      <Dialog
        open={!!driverToHardDelete}
        onOpenChange={(open) => {
          if (!open) setDriverToHardDelete(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="size-5" />
              Suppression définitive
            </DialogTitle>
            <DialogDescription>
              Cette action est{' '}
              <span className="font-semibold text-destructive">
                irréversible
              </span>
              .{' '}
              <span className="font-semibold">
                {driverToHardDelete?.patient.full_name}
              </span>{' '}
              et toutes ses données seront supprimés définitivement.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDriverToHardDelete(null)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                driverToHardDelete &&
                hardDeleteMutation.mutate(driverToHardDelete.id)
              }
              disabled={hardDeleteMutation.isPending}
            >
              {hardDeleteMutation.isPending && (
                <Loader2 className="mr-2 size-4 animate-spin" />
              )}
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
