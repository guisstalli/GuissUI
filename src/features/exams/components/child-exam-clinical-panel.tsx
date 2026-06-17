'use client';

import { Check, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  ClinicalCheckChildForm,
  VisionBinoculaireForm,
} from '@/features/exams/components/forms';
import { cn } from '@/lib/utils';

type ClinicalSubsection = 'visionBinoculaire' | 'clinicalCheck';

interface ChildExamClinicalPanelProps {
  examId: string;
  clinicalSubsection: ClinicalSubsection;
  setClinicalSubsection: (s: ClinicalSubsection) => void;
  handleSaveClinical: () => void;
  isSaving: boolean;
  simplifiedClinicalExam: boolean;
  onToggleSimplifiedClinicalExam: (enabled: boolean) => void;
}

export function ChildExamClinicalPanel({
  examId,
  clinicalSubsection,
  setClinicalSubsection,
  handleSaveClinical,
  isSaving,
  simplifiedClinicalExam,
  onToggleSimplifiedClinicalExam,
}: ChildExamClinicalPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Examen Clinique</h1>
          <p className="text-sm text-muted-foreground">
            Vision binoculaire et examen clinique simplifié
          </p>
        </div>
        {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
        <label
          htmlFor="toggle-clinical-exam"
          className="bg-muted/30 flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-2"
        >
          <div className="text-right">
            <p className="text-sm font-medium">Examen clinique complet</p>
            <p className="text-xs text-muted-foreground">
              Active biomicroscopie, périmétrie et conclusion
            </p>
          </div>
          <Switch
            id="toggle-clinical-exam"
            checked={simplifiedClinicalExam}
            onCheckedChange={onToggleSimplifiedClinicalExam}
            disabled={isSaving || examId === 'new'}
          />
        </label>
      </div>
      <div className="my-2 flex w-fit gap-1 rounded-lg border bg-card p-1">
        {(
          [
            ['visionBinoculaire', 'Vision Binoculaire'],
            ['clinicalCheck', 'Examen Clinique'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              clinicalSubsection === id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
            onClick={() => setClinicalSubsection(id as ClinicalSubsection)}
          >
            {label}
          </button>
        ))}
      </div>
      {clinicalSubsection === 'visionBinoculaire' && (
        <VisionBinoculaireForm namePrefix="visionBinoculaire" />
      )}
      {clinicalSubsection === 'clinicalCheck' && (
        <ClinicalCheckChildForm namePrefix="clinicalCheck" />
      )}
      <div className="mt-6 flex justify-end border-t border-border pt-4">
        <Button
          type="button"
          onClick={handleSaveClinical}
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
