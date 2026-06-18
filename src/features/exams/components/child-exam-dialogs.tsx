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

interface ChildExamDialogsProps {
  showSaveDialog: boolean;
  setShowSaveDialog: (b: boolean) => void;
  handleSaveConclusion: () => void;
  showFinalizeDialog: boolean;
  setShowFinalizeDialog: (b: boolean) => void;
  handleFinalizeExam: () => void;
  isCompleting: boolean;
}

export function ChildExamDialogs({
  showSaveDialog,
  setShowSaveDialog,
  handleSaveConclusion,
  showFinalizeDialog,
  setShowFinalizeDialog,
  handleFinalizeExam,
  isCompleting,
}: ChildExamDialogsProps) {
  return (
    <>
      {/* Conclusion save confirmation */}
      <AlertDialog
        open={showSaveDialog}
        onOpenChange={(open) => {
          if (!open) setShowSaveDialog(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enregistrer la conclusion</AlertDialogTitle>
            <AlertDialogDescription>
              La conclusion sera enregistrée. Vous pourrez la modifier
              ultérieurement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveConclusion}>
              Enregistrer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Finalize exam confirmation */}
      <AlertDialog
        open={showFinalizeDialog}
        onOpenChange={(open) => {
          if (!open) setShowFinalizeDialog(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finaliser l&apos;examen</AlertDialogTitle>
            <AlertDialogDescription>
              L&apos;examen sera marqué comme terminé. Cette action peut être
              nécessaire pour générer les rapports PDF. Vous pourrez toujours
              modifier les sections individuellement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinalizeExam}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isCompleting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Finaliser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
