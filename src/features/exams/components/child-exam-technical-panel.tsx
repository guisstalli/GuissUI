'use client';

import { Check, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  OcularTensionForm,
  RefractionForm,
  VisualAcuityForm,
} from '@/features/exams/components/forms';
import { cn } from '@/lib/utils';

type TechnicalSubsection = 'acuity' | 'refraction' | 'tension';

interface ChildExamTechnicalPanelProps {
  examId: string;
  technicalSubsection: TechnicalSubsection;
  setTechnicalSubsection: (s: TechnicalSubsection) => void;
  handleSaveTechnical: () => void;
  isSaving: boolean;
}

export function ChildExamTechnicalPanel({
  examId,
  technicalSubsection,
  setTechnicalSubsection,
  handleSaveTechnical,
  isSaving,
}: ChildExamTechnicalPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div>
        <h1 className="text-xl font-semibold">Examen Technique</h1>
        <p className="text-sm text-muted-foreground">
          Acuité visuelle, réfraction et tension oculaire
        </p>
      </div>
      <div className="my-2 flex w-fit gap-1 rounded-lg border bg-card p-1">
        {(
          [
            ['acuity', 'Acuité Visuelle'],
            ['refraction', 'Réfraction'],
            ['tension', 'Tension'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              technicalSubsection === id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
            onClick={() => setTechnicalSubsection(id as TechnicalSubsection)}
          >
            {label}
          </button>
        ))}
      </div>
      {technicalSubsection === 'acuity' && (
        <VisualAcuityForm namePrefix="visualAcuity" />
      )}
      {technicalSubsection === 'refraction' && (
        <RefractionForm namePrefix="refraction" />
      )}
      {technicalSubsection === 'tension' && (
        <OcularTensionForm namePrefix="ocularTension" />
      )}
      <div className="mt-6 flex justify-end border-t border-border pt-4">
        <Button
          type="button"
          onClick={handleSaveTechnical}
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
