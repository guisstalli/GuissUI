'use client';

import { Loader2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/dialog';

interface AdultExamFinalizeDialogProps {
  open: boolean;
  onOpenChange: (b: boolean) => void;
  handleFinalizeExam: () => void;
  isCompleting: boolean;
}

export function AdultExamFinalizeDialog({
  open,
  onOpenChange,
  handleFinalizeExam,
  isCompleting,
}: AdultExamFinalizeDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Finaliser l&apos;examen</AlertDialogTitle>
          <AlertDialogDescription>
            Êtes-vous sûr de vouloir finaliser cet examen ? L&apos;examen sera
            marqué comme terminé et les données ne pourront plus être modifiées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleFinalizeExam}
            disabled={isCompleting}
          >
            {isCompleting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Finaliser
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
