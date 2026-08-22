'use client';

import { Check, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { OcularTensionForm } from '@/features/exams/components/forms/ocular-tension-form';
import { PachymetryForm } from '@/features/exams/components/forms/pachymetry-form';
import { RefractionForm } from '@/features/exams/components/forms/refraction-form';
import { VisualAcuityForm } from '@/features/exams/components/forms/visual-acuity-form';
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
          Acuité visuelle, réfraction, tension oculaire et pachymétrie
        </p>
      </div>
      <div className="my-2 flex w-fit gap-1 rounded-lg border bg-card p-1">
        {(
          [
            ['acuity', 'Acuité Visuelle'],
            ['refraction', 'Réfraction'],
            ['tension', 'Tension Oculaire - Pachymétrie'],
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
        <RefractionForm namePrefix="refraction" scope={examId} />
      )}
      {technicalSubsection === 'tension' && (
        <div className="space-y-8">
          <OcularTensionForm namePrefix="ocularTension" />
          {/* Onglets fusionnés, comme chez l'adulte : les deux mesures se
              lisent ensemble et partaient déjà dans la même sauvegarde. */}
          <div className="border-t border-border pt-8">
            <PachymetryForm namePrefix="pachymetry" />
          </div>
        </div>
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
