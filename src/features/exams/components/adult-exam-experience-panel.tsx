'use client';

import { Car } from 'lucide-react';

import { DriverExperienceForm } from '@/features/exams/components/forms';

interface AdultExamExperiencePanelProps {
  numericExamId: number;
}

export function AdultExamExperiencePanel({
  numericExamId,
}: AdultExamExperiencePanelProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <h2 className="flex items-center gap-2 text-lg font-medium text-foreground">
          <Car className="size-5" aria-hidden="true" />
          Expérience conduite
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Suivi de l&apos;expérience de conduite pour cette visite
        </p>
      </div>
      <div className="p-6">
        <DriverExperienceForm examId={numericExamId} />
      </div>
    </div>
  );
}
