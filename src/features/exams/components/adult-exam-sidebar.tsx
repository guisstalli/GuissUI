'use client';

import {
  Check,
  Circle,
  Download,
  FileText,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/ui/can/can';
import type { Section } from '@/features/exams/types/adult-exam';
import { cn } from '@/lib/utils';

import type { AdultExamPatient, SectionStatus } from './adult-exam-types';
import { ShareRecordDialog } from './share-record-dialog';

interface AdultExamSidebarSection {
  id: Section;
  title: string;
  icon: LucideIcon;
}

interface AdultExamSidebarOrdonnance {
  id: number;
}

interface AdultExamSidebarProps {
  examId: string;
  patient: AdultExamPatient;
  sections: AdultExamSidebarSection[];
  activeSection: Section;
  setActiveSection: (s: Section) => void;
  sectionStatus: SectionStatus;
  technicalCompleted: number;
  clinicalCompleted: number;
  totalTechnical: number;
  totalClinical: number;
  isComplete: boolean;
  isCompleting: boolean;
  isUncompleting: boolean;
  setShowSaveDialog: (b: boolean) => void;
  handleUncompleteExam: () => void;
  // PDF reports
  isDownloadingReport: boolean;
  isDownloadingConclusion: boolean;
  downloadReport: (id: number) => void;
  downloadConclusion: (id: number) => void;
  // Ordonnances
  canGenerateOrdonnance: boolean;
  medicamentOrdonnance?: AdultExamSidebarOrdonnance | null;
  optiqueOrdonnance?: AdultExamSidebarOrdonnance | null;
  setMedicamentDialogOpen: (b: boolean) => void;
  setOptiqueDialogOpen: (b: boolean) => void;
  downloadOrdonnance: (args: {
    ordonnanceId: number;
    typeOrdonnance: 'MEDICAMENTEUSE' | 'OPTIQUE';
  }) => void;
}

export function AdultExamSidebar({
  examId,
  patient,
  sections,
  activeSection,
  setActiveSection,
  sectionStatus,
  technicalCompleted,
  clinicalCompleted,
  totalTechnical,
  totalClinical,
  isComplete,
  isCompleting,
  isUncompleting,
  setShowSaveDialog,
  handleUncompleteExam,
  isDownloadingReport,
  isDownloadingConclusion,
  downloadReport,
  downloadConclusion,
  canGenerateOrdonnance,
  medicamentOrdonnance,
  optiqueOrdonnance,
  setMedicamentDialogOpen,
  setOptiqueDialogOpen,
  downloadOrdonnance,
}: AdultExamSidebarProps) {
  return (
    <aside className="size-full overflow-y-auto border-r border-border bg-card p-4">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-foreground">Sections</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Progression de l&apos;examen
        </p>
      </div>

      <nav aria-label="Exam sections">
        <ul className="space-y-1">
          {sections.map((section) => {
            const isActive = activeSection === section.id;
            let statusText = '';
            let statusIcon = (
              <Circle className="text-muted-foreground/50 size-4" />
            );

            if (section.id === 'technical') {
              statusText = `${technicalCompleted}/${totalTechnical}`;
              if (technicalCompleted === totalTechnical) {
                statusIcon = <Check className="size-4 text-primary" />;
              }
            } else if (section.id === 'clinical') {
              statusText = `${clinicalCompleted}/${totalClinical}`;
              if (clinicalCompleted === totalClinical) {
                statusIcon = <Check className="size-4 text-primary" />;
              }
            } else if (section.id === 'conclusion') {
              statusText = sectionStatus.conclusion ? 'Complété' : 'En attente';
              if (sectionStatus.conclusion) {
                statusIcon = <Check className="size-4 text-primary" />;
              }
            } else if (section.id === 'experience') {
              statusText = '';
            }

            return (
              <li key={section.id}>
                <button
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                  )}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <section.icon
                    className="size-4 shrink-0"
                    aria-hidden="true"
                  />
                  <span className="flex-1 text-left">{section.title}</span>
                  <span className="text-xs">{statusText}</span>
                  {statusIcon}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Patient Info */}
      <div className="bg-muted/30 mt-6 rounded-lg border border-border p-3">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Patient
        </h3>
        <p className="mt-1 text-sm font-medium text-foreground">
          {patient.lastName}, {patient.firstName}
        </p>
        <p className="text-xs text-muted-foreground">
          {patient.age} ans, {patient.sex}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-1">
          <Badge variant="secondary">Adulte</Badge>
          {patient.hasDriver && <Badge variant="secondary">Conducteur</Badge>}
          <Badge variant={isComplete ? 'default' : 'outline'}>
            {isComplete ? 'Terminé' : 'En cours'}
          </Badge>
        </div>
      </div>

      {/* Finalize / Reopen Button */}
      <div className="mt-6">
        {isComplete ? (
          <Button
            variant="outline"
            className="w-full"
            onClick={handleUncompleteExam}
            disabled={isUncompleting}
          >
            {isUncompleting ? (
              <Loader2 className="mr-2 size-4 animate-spin" />
            ) : (
              <RotateCcw className="mr-2 size-4" />
            )}
            Rouvrir l&apos;examen
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={() => setShowSaveDialog(true)}
            disabled={isCompleting}
          >
            {isCompleting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Finaliser l&apos;examen
          </Button>
        )}
        {!isComplete && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Complétez toutes les sections
          </p>
        )}
      </div>

      {examId !== 'new' && (
        <div className="mt-4 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Dossier PDF
          </p>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            disabled={isDownloadingReport}
            onClick={() => downloadReport(Number(examId))}
          >
            {isDownloadingReport ? (
              <Loader2
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <Download className="mr-2 size-4" aria-hidden="true" />
            )}
            Dossier complet
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            disabled={isDownloadingConclusion}
            onClick={() => downloadConclusion(Number(examId))}
          >
            {isDownloadingConclusion ? (
              <Loader2
                className="mr-2 size-4 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <FileText className="mr-2 size-4" aria-hidden="true" />
            )}
            Conclusion PDF
          </Button>
        </div>
      )}

      {examId !== 'new' && (
        <Can permission="records:share">
          <div className="mt-4 space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Partage
            </p>
            <ShareRecordDialog examType="adulte" examId={Number(examId)} />
          </div>
        </Can>
      )}

      {examId !== 'new' &&
        (canGenerateOrdonnance ||
          medicamentOrdonnance ||
          optiqueOrdonnance) && (
          <div className="mt-4 space-y-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Ordonnances
            </p>

            {/* Ligne 1 : Ordonnance médicamenteuse */}
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-foreground">
                Médicamenteuse
              </p>
              {canGenerateOrdonnance && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setMedicamentDialogOpen(true)}
                >
                  <FileText className="mr-2 size-4" aria-hidden="true" />
                  {medicamentOrdonnance ? 'Modifier' : 'Rédiger'}
                </Button>
              )}
              {medicamentOrdonnance && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() =>
                    downloadOrdonnance({
                      ordonnanceId: medicamentOrdonnance.id,
                      typeOrdonnance: 'MEDICAMENTEUSE',
                    })
                  }
                >
                  <Download className="mr-2 size-3" aria-hidden="true" />
                  Télécharger
                </Button>
              )}
            </div>

            {/* Ligne 2 : Ordonnance de correction optique */}
            <div className="space-y-1">
              <p className="text-[11px] font-semibold text-foreground">
                Correction optique
              </p>
              {canGenerateOrdonnance && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setOptiqueDialogOpen(true)}
                >
                  <FileText className="mr-2 size-4" aria-hidden="true" />
                  {optiqueOrdonnance ? 'Modifier' : 'Rédiger'}
                </Button>
              )}
              {optiqueOrdonnance && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                  onClick={() =>
                    downloadOrdonnance({
                      ordonnanceId: optiqueOrdonnance.id,
                      typeOrdonnance: 'OPTIQUE',
                    })
                  }
                >
                  <Download className="mr-2 size-3" aria-hidden="true" />
                  Télécharger
                </Button>
              )}
            </div>
          </div>
        )}
    </aside>
  );
}
