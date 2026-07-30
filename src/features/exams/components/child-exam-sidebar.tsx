'use client';

import {
  Check,
  Circle,
  Download,
  FileText,
  Loader2,
  RotateCcw,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/ui/can/can';
import { Progress } from '@/components/ui/progress/progress';
import type {
  OrdonnanceListItem,
  TypeOrdonnance,
} from '@/features/exams/api/ordonnances';
import { cn } from '@/lib/utils';

import { ShareRecordDialog } from './share-record-dialog';

type Section = 'technical' | 'clinical' | 'complementary' | 'conclusion';

interface SectionStatus {
  technical: boolean;
  clinical: boolean;
  complementary: boolean;
  conclusion: boolean;
}

interface SidebarSection {
  id: Section;
  title: string;
  icon: LucideIcon;
}

interface ChildExamSidebarPatient {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  sex: string;
  medicalRecordNumber: string;
}

interface ChildExamSidebarProps {
  examId: string;
  patient: ChildExamSidebarPatient;
  visibleSections: SidebarSection[];
  completedCount: number;
  totalCount: number;
  activeSection: Section;
  setActiveSection: (s: Section) => void;
  sectionStatus: SectionStatus;
  handleSaveSection: () => void;
  isSaving: boolean;
  isComplete: boolean;
  isCompleting: boolean;
  isUncompleting: boolean;
  setShowFinalizeDialog: (b: boolean) => void;
  handleUncompleteExam: () => void;
  isDownloadingReport: boolean;
  downloadReport: (id: number) => void;
  isDownloadingConclusion: boolean;
  downloadConclusion: (id: number) => void;
  canGenerateOrdonnance: boolean;
  medicamentOrdonnance?: OrdonnanceListItem;
  optiqueOrdonnance?: OrdonnanceListItem;
  downloadOrdonnance: (args: {
    ordonnanceId: number;
    typeOrdonnance: TypeOrdonnance;
  }) => void;
  setMedicamentDialogOpen: (b: boolean) => void;
  setOptiqueDialogOpen: (b: boolean) => void;
}

export function ChildExamSidebar({
  examId,
  patient,
  visibleSections,
  completedCount,
  totalCount,
  activeSection,
  setActiveSection,
  sectionStatus,
  handleSaveSection,
  isSaving,
  isComplete,
  isCompleting,
  isUncompleting,
  setShowFinalizeDialog,
  handleUncompleteExam,
  isDownloadingReport,
  downloadReport,
  isDownloadingConclusion,
  downloadConclusion,
  canGenerateOrdonnance,
  medicamentOrdonnance,
  optiqueOrdonnance,
  downloadOrdonnance,
  setMedicamentDialogOpen,
  setOptiqueDialogOpen,
}: ChildExamSidebarProps) {
  return (
    <aside className="size-full overflow-y-auto border-r border-border bg-card p-4">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Sections</h2>
          <span className="text-xs font-medium text-muted-foreground">
            {completedCount}/{totalCount}
          </span>
        </div>
        <Progress
          value={totalCount > 0 ? (completedCount / totalCount) * 100 : 0}
          className={cn(
            'mt-2 h-1.5',
            completedCount === totalCount && totalCount > 0
              ? '[&>div]:bg-emerald-500'
              : '',
          )}
        />
      </div>

      <nav aria-label="Exam sections">
        <ul className="space-y-1">
          {visibleSections.map((section) => {
            const isActive = activeSection === section.id;
            const isDone = sectionStatus[section.id];
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
                  {isDone ? (
                    <Check className="size-4 text-primary" />
                  ) : (
                    <Circle className="text-muted-foreground/50 size-4" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

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
        <div className="mt-2">
          <Badge variant="secondary">Enfant</Badge>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <Button
          className="w-full"
          onClick={handleSaveSection}
          disabled={isSaving || examId === 'new'}
        >
          {isSaving ? (
            <Loader2 className="mr-2 size-4 animate-spin" />
          ) : (
            <Check className="mr-2 size-4" />
          )}
          Enregistrer
        </Button>
        <Button variant="outline" size="sm" className="w-full" asChild>
          <Link href={patient.id ? `/patients/${patient.id}` : '/patients'}>
            ← Retour patient
          </Link>
        </Button>
        {examId !== 'new' &&
          (isComplete ? (
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              disabled={isUncompleting}
              onClick={handleUncompleteExam}
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
              size="sm"
              className="w-full bg-emerald-600 text-white hover:bg-emerald-700"
              disabled={isCompleting}
              onClick={() => setShowFinalizeDialog(true)}
            >
              {isCompleting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <Check className="mr-2 size-4" />
              )}
              Finaliser l&apos;examen
            </Button>
          ))}
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
            <ShareRecordDialog examType="enfant" examId={Number(examId)} />
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
