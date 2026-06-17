'use client';

import { Check, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ConclusionForm } from '@/features/exams/components/forms/conclusion-form';

interface ChildExamConclusionPanelProps {
  examId: string;
  isSaving: boolean;
  onRequestSave: () => void;
}

export function ChildExamConclusionPanel({
  examId,
  isSaving,
  onRequestSave,
}: ChildExamConclusionPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div>
        <h1 className="text-xl font-semibold">Conclusion</h1>
        <p className="text-sm text-muted-foreground">
          Vision, CAT, traitement et diagnostic
        </p>
      </div>
      <ConclusionForm namePrefix="conclusion" />
      <div className="mt-6 flex justify-end border-t border-border pt-4">
        <Button
          type="button"
          onClick={onRequestSave}
          disabled={isSaving || examId === 'new'}
        >
          {isSaving ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Check className="mr-2 size-4" />
          )}
          Sauvegarder
        </Button>
      </div>
    </div>
  );
}
