'use client';

import { Check, Eye, Loader2, Save } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OcularTensionForm } from '@/features/exams/components/forms/ocular-tension-form';
import { PachymetryForm } from '@/features/exams/components/forms/pachymetry-form';
import { RefractionForm } from '@/features/exams/components/forms/refraction-form';
import { VisualAcuityForm } from '@/features/exams/components/forms/visual-acuity-form';
import type { TechnicalSubsection } from '@/features/exams/types/adult-exam';

import type { SectionStatus } from './adult-exam-types';

interface AdultExamTechnicalPanelProps {
  examId: string;
  technicalSubsection: TechnicalSubsection;
  setTechnicalSubsection: (s: TechnicalSubsection) => void;
  sectionStatus: SectionStatus;
  handleSaveSection: (section: 'technical') => void;
  isSaving: boolean;
}

export function AdultExamTechnicalPanel({
  examId,
  technicalSubsection,
  setTechnicalSubsection,
  sectionStatus,
  handleSaveSection,
  isSaving,
}: AdultExamTechnicalPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <h2 className="flex items-center gap-2 text-lg font-medium text-foreground">
          <Eye className="size-5" aria-hidden="true" />
          Examen Technique
        </h2>
      </div>

      <Tabs
        value={technicalSubsection}
        onValueChange={(v) => setTechnicalSubsection(v as TechnicalSubsection)}
      >
        <TabsList className="w-full justify-start overflow-x-auto rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="acuity"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Acuité Visuelle
            {sectionStatus.technical.acuity && (
              <Check className="ml-1 size-3 text-primary" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="refraction"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Réfraction
            {sectionStatus.technical.refraction && (
              <Check className="ml-1 size-3 text-primary" />
            )}
          </TabsTrigger>
          {/* Onglets fusionnés : les deux mesures se lisent ensemble — la
              correction de tension (CTO) dépend de l'épaisseur cornéenne. Les
              séparer obligeait à passer de l'un à l'autre pour un même geste.
              La pastille n'apparaît que si les DEUX sont renseignées. */}
          <TabsTrigger
            value="tension"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Tension Oculaire - Pachymétrie
            {sectionStatus.technical.tension &&
              sectionStatus.technical.pachymetry && (
                <Check className="ml-1 size-3 text-primary" />
              )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="acuity" className="p-6">
          <VisualAcuityForm namePrefix="visualAcuity" />
          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <Button
              type="button"
              onClick={() => handleSaveSection('technical')}
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
        </TabsContent>

        <TabsContent value="refraction" className="p-6">
          <RefractionForm namePrefix="refraction" scope={examId} />
          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <Button
              type="button"
              onClick={() => handleSaveSection('technical')}
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
        </TabsContent>

        <TabsContent value="tension" className="p-6">
          <div className="space-y-8">
            <OcularTensionForm namePrefix="ocularTension" />
            {/* Séparateur : deux mesures distinctes, une seule saisie. Un seul
                bouton en bas — les deux formulaires appartiennent à la même
                section technique et sont enregistrés ensemble. */}
            <div className="border-t border-border pt-8">
              <PachymetryForm namePrefix="pachymetry" />
            </div>
          </div>
          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <Button
              type="button"
              onClick={() => handleSaveSection('technical')}
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
