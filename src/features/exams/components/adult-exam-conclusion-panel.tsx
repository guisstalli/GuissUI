'use client';

import { Loader2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ConclusionForm } from '@/features/exams/components/forms';

interface AdultExamConclusionPanelProps {
  handleSaveSection: (section: 'conclusion') => void;
  isSaving: boolean;
}

export function AdultExamConclusionPanel({
  handleSaveSection,
  isSaving,
}: AdultExamConclusionPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <ConclusionForm namePrefix="conclusion" />
      <div className="mt-6 flex justify-end border-t border-border pt-4">
        <Button
          type="button"
          onClick={() => handleSaveSection('conclusion')}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="mr-1.5 size-4 animate-spin" />
          ) : (
            <Save className="mr-1.5 size-4" aria-hidden="true" />
          )}
          Sauvegarder
        </Button>
      </div>
    </div>
  );
}
