'use client';

import { type UseFormReturn } from 'react-hook-form';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ClinicalExamFormValues } from '@/features/exams/types/schemas';

import { BiomicroscopyEyePanel } from './clinical-biomicroscopy-eye-panel';

interface BiomicroscopySectionProps {
  form: UseFormReturn<ClinicalExamFormValues>;
  odSegmentAnterior: string | undefined;
  odCornee: string | null | undefined;
  odTransparence: string | null | undefined;
  odIris: string | null | undefined;
  odSegmentPosterior: string | undefined;
  ogSegmentAnterior: string | undefined;
  ogCornee: string | null | undefined;
  ogTransparence: string | null | undefined;
  ogIris: string | null | undefined;
  ogSegmentPosterior: string | undefined;
}

export function BiomicroscopySection({
  form,
  odSegmentAnterior,
  odCornee,
  odTransparence,
  odIris,
  odSegmentPosterior,
  ogSegmentAnterior,
  ogCornee,
  ogTransparence,
  ogIris,
  ogSegmentPosterior,
}: BiomicroscopySectionProps) {
  return (
    <section className="space-y-4">
      <div className="border-b border-border pb-2">
        <h3 className="text-sm font-semibold text-foreground">
          Biomicroscopie
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Examen à la lampe à fente - Segment antérieur et postérieur
        </p>
      </div>

      <Tabs defaultValue="od" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="od">OD (Œil droit)</TabsTrigger>
          <TabsTrigger value="og">OG (Œil gauche)</TabsTrigger>
        </TabsList>

        {/* OD */}
        <TabsContent value="od" className="space-y-6">
          <BiomicroscopyEyePanel
            form={form}
            eye="od"
            segmentAnterior={odSegmentAnterior}
            cornee={odCornee}
            transparence={odTransparence}
            iris={odIris}
            segmentPosterior={odSegmentPosterior}
          />
        </TabsContent>

        {/* OG - Structure identique à OD */}
        <TabsContent value="og" className="space-y-6">
          <BiomicroscopyEyePanel
            form={form}
            eye="og"
            segmentAnterior={ogSegmentAnterior}
            cornee={ogCornee}
            transparence={ogTransparence}
            iris={ogIris}
            segmentPosterior={ogSegmentPosterior}
          />
        </TabsContent>
      </Tabs>
    </section>
  );
}
