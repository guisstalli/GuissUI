'use client';

import { Check, Loader2, Paperclip, Save, Stethoscope } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BiomicroscopyAnteriorForm } from '@/features/exams/components/forms/biomicroscopy-anterior-form';
import { BiomicroscopyPosteriorForm } from '@/features/exams/components/forms/biomicroscopy-posterior-form';
import { ExamensAdditionelsSection } from '@/features/exams/components/forms/examens-additionnels-section';
import { PerimetryForm } from '@/features/exams/components/forms/perimetry-form';
import { PlaintesForm } from '@/features/exams/components/forms/plaintes-form';
import type { ClinicalSubsection } from '@/features/exams/types/adult-exam';

import type { SectionStatus } from './adult-exam-types';
import { ExamAttachmentsSection } from './exam-attachments-section';

interface AdultExamClinicalPanelProps {
  clinicalSubsection: ClinicalSubsection;
  setClinicalSubsection: (s: ClinicalSubsection) => void;
  sectionStatus: SectionStatus;
  handleSaveSection: (section: 'clinical') => void;
  isSaving: boolean;
  // Attachments
  clinicalExamId?: number;
  onUploaded?: () => void;
}

export function AdultExamClinicalPanel({
  clinicalSubsection,
  setClinicalSubsection,
  sectionStatus,
  handleSaveSection,
  isSaving,
  clinicalExamId,
  onUploaded,
}: AdultExamClinicalPanelProps) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="border-b border-border p-4">
        <h2 className="flex items-center gap-2 text-lg font-medium text-foreground">
          <Stethoscope className="size-5" aria-hidden="true" />
          Examen Clinique
        </h2>
      </div>

      <Tabs
        value={clinicalSubsection}
        onValueChange={(v) => setClinicalSubsection(v as ClinicalSubsection)}
      >
        <TabsList className="w-full justify-start overflow-x-auto rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="plaintes"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Plaintes
            {sectionStatus.clinical.plaintes && (
              <Check className="ml-1 size-3 text-primary" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="biomicroscopy"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Biomicroscopie
            {sectionStatus.clinical.biomicroscopy && (
              <Check className="ml-1 size-3 text-primary" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="perimetry"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            Examens complementaires
            {sectionStatus.clinical.perimetry && (
              <Check className="ml-1 size-3 text-primary" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="attachments"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
          >
            <Paperclip className="mr-1 size-3" />
            Fichiers joints
            {sectionStatus.clinical.attachments && (
              <Check className="ml-1 size-3 text-primary" />
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plaintes" className="p-6">
          <PlaintesForm namePrefix="plaintes" />
          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <Button
              type="button"
              onClick={() => handleSaveSection('clinical')}
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

        <TabsContent value="biomicroscopy" className="space-y-8 p-6">
          {/* Biomicroscopy with Eye Tabs */}
          <Tabs defaultValue="od" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-2">
              <TabsTrigger value="od">OD (Oeil Droit)</TabsTrigger>
              <TabsTrigger value="og">OG (Oeil Gauche)</TabsTrigger>
            </TabsList>

            <TabsContent value="od" className="space-y-6">
              <Tabs defaultValue="anterior">
                <TabsList>
                  <TabsTrigger value="anterior">Segment Antérieur</TabsTrigger>
                  <TabsTrigger value="posterior">
                    Segment Postérieur
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="anterior" className="pt-4">
                  <BiomicroscopyAnteriorForm
                    namePrefix="od.bp_sg_anterieur"
                    eyeLabel="OD"
                  />
                </TabsContent>
                <TabsContent value="posterior" className="pt-4">
                  <BiomicroscopyPosteriorForm
                    namePrefix="od.bp_sg_posterieur"
                    eyeLabel="OD"
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>

            <TabsContent value="og" className="space-y-6">
              <Tabs defaultValue="anterior">
                <TabsList>
                  <TabsTrigger value="anterior">Segment Antérieur</TabsTrigger>
                  <TabsTrigger value="posterior">
                    Segment Postérieur
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="anterior" className="pt-4">
                  <BiomicroscopyAnteriorForm
                    namePrefix="og.bp_sg_anterieur"
                    eyeLabel="OG"
                  />
                </TabsContent>
                <TabsContent value="posterior" className="pt-4">
                  <BiomicroscopyPosteriorForm
                    namePrefix="og.bp_sg_posterieur"
                    eyeLabel="OG"
                  />
                </TabsContent>
              </Tabs>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end border-t border-border pt-4">
            <Button
              type="button"
              onClick={() => handleSaveSection('clinical')}
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

        <TabsContent value="perimetry" className="space-y-6 p-6">
          <PerimetryForm namePrefix="perimetry" />
          <ExamensAdditionelsSection namePrefix="perimetry" />
          <div className="mt-6 flex justify-end border-t border-border pt-4">
            <Button
              type="button"
              onClick={() => handleSaveSection('clinical')}
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

        {/* Attachments Tab */}
        <TabsContent value="attachments" className="p-6">
          <ExamAttachmentsSection
            clinicalExamId={clinicalExamId}
            onUploaded={onUploaded}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
