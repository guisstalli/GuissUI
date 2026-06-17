'use client';

import { Check, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BiomicroscopyAnteriorForm } from '@/features/exams/components/forms/biomicroscopy-anterior-form';
import { BiomicroscopyPosteriorForm } from '@/features/exams/components/forms/biomicroscopy-posterior-form';
import { ExamensAdditionelsSection } from '@/features/exams/components/forms/examens-additionnels-section';
import { PerimetryForm } from '@/features/exams/components/forms/perimetry-form';
import { PlaintesForm } from '@/features/exams/components/forms/plaintes-form';
import { cn } from '@/lib/utils';

import { ChildExamAttachmentsSection } from './child-exam-attachments-section';

type ComplementarySubsection =
  | 'plaintes'
  | 'biomicroscopy'
  | 'perimetry'
  | 'attachments';

export interface ChildExamAttachment {
  id: number;
  original_filename: string;
  file_url?: string | null;
  file_size: number;
  description?: string | null;
  is_image: boolean;
  is_pdf: boolean;
  created: string;
}

interface ChildExamComplementaryPanelProps {
  examId: string;
  complementarySubsection: ComplementarySubsection;
  setComplementarySubsection: (s: ComplementarySubsection) => void;
  handleSaveComplementary: () => void;
  isSaving: boolean;
  clinicalExamId?: number;
}

export function ChildExamComplementaryPanel({
  examId,
  complementarySubsection,
  setComplementarySubsection,
  handleSaveComplementary,
  isSaving,
  clinicalExamId,
}: ChildExamComplementaryPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div>
        <h1 className="text-xl font-semibold">Examens Complémentaires</h1>
        <p className="text-sm text-muted-foreground">
          Plaintes, périmétrie, biomicroscopie et pièces jointes
        </p>
      </div>
      <div className="my-2 flex w-fit flex-wrap gap-1 rounded-lg border  p-1">
        {(
          [
            ['plaintes', 'Plaintes'],
            ['biomicroscopy', 'Biomicroscopie'],
            ['perimetry', 'Périmétrie'],
            ['attachments', 'Pièces jointes'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              complementarySubsection === id
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
            onClick={() =>
              setComplementarySubsection(id as ComplementarySubsection)
            }
          >
            {label}
          </button>
        ))}
      </div>

      {complementarySubsection === 'plaintes' && (
        <PlaintesForm namePrefix="plaintes" />
      )}
      {complementarySubsection === 'perimetry' && (
        <div className="rounded-lg border border-border bg-card p-4">
          <PerimetryForm namePrefix="perimetry" />
          <ExamensAdditionelsSection namePrefix="perimetry" />
        </div>
      )}
      {complementarySubsection === 'biomicroscopy' && (
        <div className="rounded-lg border border-border bg-card p-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Biomicroscopie — OD</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <BiomicroscopyAnteriorForm
                namePrefix="od.bp_sg_anterieur"
                eyeLabel="OD"
              />
              <BiomicroscopyPosteriorForm
                namePrefix="od.bp_sg_posterieur"
                eyeLabel="OD"
              />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Biomicroscopie — OG</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <BiomicroscopyAnteriorForm
                namePrefix="og.bp_sg_anterieur"
                eyeLabel="OG"
              />
              <BiomicroscopyPosteriorForm
                namePrefix="og.bp_sg_posterieur"
                eyeLabel="OG"
              />
            </CardContent>
          </Card>
        </div>
      )}
      {complementarySubsection !== 'attachments' && (
        <div className="mt-6 flex justify-end border-t border-border pt-4">
          <Button
            type="button"
            onClick={handleSaveComplementary}
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
      )}
      {complementarySubsection === 'attachments' && (
        <ChildExamAttachmentsSection clinicalExamId={clinicalExamId} />
      )}
    </div>
  );
}
