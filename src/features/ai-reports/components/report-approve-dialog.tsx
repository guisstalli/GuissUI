'use client';

import { CheckCircle, Loader2 } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import { Label } from '@/components/ui/form';

import { useApproveReport } from '../api/approve-report';

interface ReportApproveDialogProps {
  reportId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportApproveDialog({
  reportId,
  open,
  onOpenChange,
}: ReportApproveDialogProps) {
  const [editedDocx, setEditedDocx] = useState<File | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const approveMutation = useApproveReport({
    mutationConfig: {
      onSuccess: () => {
        setEditedDocx(undefined);
        if (fileInputRef.current) fileInputRef.current.value = '';
        onOpenChange(false);
      },
    },
  });

  // Reset sur fermeture (Annuler/Escape/backdrop) : sans lui, un fichier
  // sélectionné puis abandonné serait silencieusement renvoyé à la
  // réouverture (le composant reste monté, seul DialogContent se démonte).
  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setEditedDocx(undefined);
      if (fileInputRef.current) fileInputRef.current.value = '';
      approveMutation.reset();
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Approuver le rapport</DialogTitle>
          <DialogDescription>
            L&apos;approbation valide le contenu pour diffusion. Si vous avez
            relu et corrigé le DOCX, joignez la version éditée : elle remplacera
            le document généré.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="edited-docx">Version relue (DOCX, optionnel)</Label>
          <input
            id="edited-docx"
            ref={fileInputRef}
            type="file"
            accept=".docx"
            className="block w-full cursor-pointer rounded-md border border-input bg-background text-sm file:mr-3 file:cursor-pointer file:rounded-l-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium"
            onChange={(event) =>
              setEditedDocx(event.target.files?.[0] ?? undefined)
            }
          />
        </div>

        {approveMutation.isError && (
          <p className="text-sm text-destructive" role="alert">
            {approveMutation.error instanceof Error
              ? approveMutation.error.message
              : "L'approbation a échoué. Réessayez."}
          </p>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={approveMutation.isPending}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={() => approveMutation.mutate({ reportId, editedDocx })}
            disabled={approveMutation.isPending}
          >
            {approveMutation.isPending ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" aria-hidden />
            ) : (
              <CheckCircle className="mr-1.5 size-4" aria-hidden />
            )}
            Approuver
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
