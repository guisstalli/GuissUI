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
import {
  useDeletedPatients,
  useHardDeletePatient,
  useRestorePatient,
} from '@/features/patients/api';
import type { PatientList } from '@/features/patients/types';

export default function CorbeillePatientPage() {
  const { data, isLoading } = useDeletedPatients();
  const [patientToRestore, setPatientToRestore] = useState<PatientList | null>(
    null,
  );
  const [patientToHardDelete, setPatientToHardDelete] =
    useState<PatientList | null>(null);

  const restoreMutation = useRestorePatient({
    mutationConfig: {
      onSuccess: () => setPatientToRestore(null),
    },
  });

  const hardDeleteMutation = useHardDeletePatient({
    mutationConfig: {
      onSuccess: () => setPatientToHardDelete(null),
    },
  });

  const patients: PatientList[] = data?.results ?? [];

  return (
    <Shell title="Corbeille des patients">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Patients supprimés</h2>
            <p className="text-sm text-muted-foreground">
              Les patients en corbeille peuvent être restaurés ou supprimés
              définitivement.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        ) : patients.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <Trash2 className="text-muted-foreground/40 mb-3 size-10" />
            <p className="font-medium text-muted-foreground">
              La corbeille est vide
            </p>
            <p className="text-muted-foreground/70 mt-1 text-sm">
              Les patients supprimés apparaîtront ici.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <TableElement className="bg-card">
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Identifiant</TableHead>
                  <TableHead>Sexe</TableHead>
                  <TableHead>Âge</TableHead>
                  <TableHead>Supprimé le</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow key={patient.id}>
                    <TableCell className="font-medium">
                      {patient.full_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {patient.numero_identifiant}
                    </TableCell>
                    <TableCell>
                      {patient.sex === 'H'
                        ? 'Homme'
                        : patient.sex === 'F'
                          ? 'Femme'
                          : 'Autre'}
                    </TableCell>
                    <TableCell>{patient.age ?? '—'}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {patient.deleted_at
                        ? dayjs(patient.deleted_at).format('DD/MM/YYYY HH:mm')
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Can permission="patients:restore">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPatientToRestore(patient)}
                          >
                            <ArchiveRestore className="mr-1.5 size-3.5" />
                            Restaurer
                          </Button>
                        </Can>
                        <Can permission="patients:hard-delete">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setPatientToHardDelete(patient)}
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
        open={!!patientToRestore}
        onOpenChange={(open) => {
          if (!open) setPatientToRestore(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restaurer le patient</DialogTitle>
            <DialogDescription>
              Voulez-vous restaurer{' '}
              <span className="font-semibold">
                {patientToRestore?.full_name}
              </span>{' '}
              ? Il redeviendra visible dans la liste des patients.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPatientToRestore(null)}>
              Annuler
            </Button>
            <Button
              onClick={() =>
                patientToRestore && restoreMutation.mutate(patientToRestore.id)
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
        open={!!patientToHardDelete}
        onOpenChange={(open) => {
          if (!open) setPatientToHardDelete(null);
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
                {patientToHardDelete?.full_name}
              </span>{' '}
              et toutes ses données seront supprimés définitivement.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPatientToHardDelete(null)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                patientToHardDelete &&
                hardDeleteMutation.mutate(patientToHardDelete.id)
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
