'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Circle,
  Eye,
  FileText,
  Loader2,
  Paperclip,
  Save,
  Stethoscope,
  Trash2,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import * as z from 'zod';

import {
  Header,
  Sidebar,
  SidebarProvider,
  useSidebar,
} from '@/components/layouts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/dialog';
import { Input, Label, Textarea } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useAdultExam,
  useAddTechnicalData,
  useAddClinicalData,
  useCompleteAdultExam,
  useAttachments,
  useUploadAttachment,
  useDeleteAttachment,
} from '@/features/exams/api';
import {
  BiomicroscopyAnteriorForm,
  BiomicroscopyPosteriorForm,
  ConclusionForm,
  OcularTensionForm,
  PachymetryForm,
  PerimetryForm,
  PlaintesForm,
  RefractionForm,
  VisualAcuityForm,
} from '@/features/exams/components/forms';
import {
  BiomicroscopyAnteriorSchema,
  BiomicroscopyPosteriorSchema,
  ConclusionSchema,
  defaultBiomicroscopyAnterior,
  defaultBiomicroscopyPosterior,
  OcularTensionSchema,
  PachymetrySchema,
  PerimetrySchema,
  PlaintesSchema,
  RefractionSchema,
  VisualAcuitySchema,
} from '@/features/exams/types';
import {
  mapVisualAcuityApiToForm,
  mapRefractionApiToForm,
  mapOcularTensionApiToForm,
  mapPachymetryApiToForm,
  mapPlaintesApiToForm,
  mapBiomicroscopyAnteriorApiToForm,
  mapBiomicroscopyPosteriorApiToForm,
  mapPerimetryApiToForm,
  mapConclusionApiToForm,
  mapTechnicalFormToApi,
} from '@/features/exams/utils';
import { cn } from '@/lib/utils';

/**
 * Adult Exam Page - Dynamique avec API
 *
 * WORKFLOW:
 * - Récupère les données depuis l'API
 * - Sections sauvegardées indépendamment
 * - Gestion des fichiers joints
 * - Affichage de l'état de complétion (is_completed)
 */

type Section = 'technical' | 'clinical' | 'conclusion';
type TechnicalSubsection = 'acuity' | 'refraction' | 'tension' | 'pachymetry';
type ClinicalSubsection =
  | 'plaintes'
  | 'biomicroscopy'
  | 'perimetry'
  | 'attachments';

interface SectionStatus {
  technical: {
    acuity: boolean;
    refraction: boolean;
    tension: boolean;
    pachymetry: boolean;
  };
  clinical: {
    plaintes: boolean;
    biomicroscopy: boolean;
    perimetry: boolean;
    attachments: boolean;
  };
  conclusion: boolean;
}

const sections = [
  { id: 'technical' as const, title: 'Examen Technique', icon: Eye },
  { id: 'clinical' as const, title: 'Examen Clinique', icon: Stethoscope },
  { id: 'conclusion' as const, title: 'Conclusion', icon: FileText },
];

// Combined schema for adult exam
const adultExamSchema = z.object({
  // Technical
  visualAcuity: VisualAcuitySchema,
  refraction: RefractionSchema,
  ocularTension: OcularTensionSchema,
  pachymetry: PachymetrySchema,
  // Clinical
  plaintes: PlaintesSchema,
  perimetry: PerimetrySchema,
  od: z.object({
    bp_sg_anterieur: BiomicroscopyAnteriorSchema,
    bp_sg_posterieur: BiomicroscopyPosteriorSchema,
  }),
  og: z.object({
    bp_sg_anterieur: BiomicroscopyAnteriorSchema,
    bp_sg_posterieur: BiomicroscopyPosteriorSchema,
  }),
  // Conclusion
  conclusion: ConclusionSchema,
});

type AdultExamFormValues = z.infer<typeof adultExamSchema>;

export default function AdultExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const isNewExam = examId === 'new';
  const numericExamId = isNewExam ? 0 : Number(examId);

  const [activeSection, setActiveSection] = useState<Section>('technical');
  const [technicalSubsection, setTechnicalSubsection] =
    useState<TechnicalSubsection>('acuity');
  const [clinicalSubsection, setClinicalSubsection] =
    useState<ClinicalSubsection>('plaintes');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [sectionStatus, setSectionStatus] = useState<SectionStatus>({
    technical: {
      acuity: false,
      refraction: false,
      tension: false,
      pachymetry: false,
    },
    clinical: {
      plaintes: false,
      biomicroscopy: false,
      perimetry: false,
      attachments: false,
    },
    conclusion: false,
  });

  // =====================================================================
  // API Hooks
  // =====================================================================

  // Récupérer les données de l'examen
  const {
    data: examData,
    isLoading: isLoadingExam,
    isError: isErrorExam,
    refetch: refetchExam,
  } = useAdultExam({
    id: numericExamId,
    enabled: !isNewExam && numericExamId > 0,
  });

  // Mutations
  const { mutate: addTechnical, isPending: isSavingTechnical } =
    useAddTechnicalData();
  const { mutate: addClinical, isPending: isSavingClinical } =
    useAddClinicalData();
  const { mutate: completeExam, isPending: isCompleting } =
    useCompleteAdultExam();

  // Pièces jointes - utiliser l'ID de l'examen clinique (clinical_examen.id)
  const clinicalExamId = examData?.clinical_examen?.id;

  const {
    data: attachmentsData,
    isLoading: isLoadingAttachments,
    refetch: refetchAttachments,
  } = useAttachments({
    clinicalExamId: clinicalExamId ?? 0,
    enabled: !!clinicalExamId,
  });

  const { mutate: uploadAttachment, isPending: isUploading } =
    useUploadAttachment();
  const { mutate: deleteAttachment, isPending: isDeleting } =
    useDeleteAttachment();

  // Données patient depuis l'API
  const patient = examData?.patient
    ? {
        id: examData.patient.id.toString(),
        firstName: examData.patient.name,
        lastName: examData.patient.last_name,
        age: examData.patient.age,
        sex: examData.patient.sex === 'H' ? 'Homme' : 'Femme',
        medicalRecordNumber: examData.patient.numero_identifiant,
      }
    : {
        id: '',
        firstName: '',
        lastName: '',
        age: 0,
        sex: '',
        medicalRecordNumber: '',
      };

  // =====================================================================
  // Form Setup
  // =====================================================================

  const form = useForm<AdultExamFormValues>({
    resolver: zodResolver(adultExamSchema),
    defaultValues: {
      visualAcuity: {
        avsc_od: null,
        avsc_og: null,
        avsc_odg: null,
        avac_od: null,
        avac_og: null,
        avac_odg: null,
      },
      refraction: {
        od_sphere: null,
        od_cylinder: null,
        od_axis: null,
        od_visual_acuity: null,
        og_sphere: null,
        og_cylinder: null,
        og_axis: null,
        og_visual_acuity: null,
        retino_od_sphere: null,
        retino_od_cylinder: null,
        retino_od_axis: null,
        retino_og_sphere: null,
        retino_og_cylinder: null,
        retino_og_axis: null,
        cyclo_od_sphere: null,
        cyclo_od_cylinder: null,
        cyclo_od_axis: null,
        cyclo_og_sphere: null,
        cyclo_og_cylinder: null,
        cyclo_og_axis: null,
        dp: null,
      },
      ocularTension: { od: null, og: null },
      pachymetry: { od: null, og: null, cto_od: null, cto_og: null },
      plaintes: {
        eye_symptom: ['AUCUN'],
        autre: null,
        diplopie: false,
        diplopie_type: null,
        strabisme: false,
        strabisme_eye: null,
        nystagmus: false,
        nystagmus_eye: null,
        ptosis: false,
        ptosis_eye: null,
      },
      perimetry: {
        pbo: ['NORMAL'],
        limite_superieure: null,
        limite_inferieure: null,
        limite_temporale_droit: null,
        limite_temporale_gauche: null,
        etendue_horizontal: null,
        score_esternmen: null,
      },
      od: {
        bp_sg_anterieur: { ...defaultBiomicroscopyAnterior },
        bp_sg_posterieur: { ...defaultBiomicroscopyPosterior },
      },
      og: {
        bp_sg_anterieur: { ...defaultBiomicroscopyAnterior },
        bp_sg_posterieur: { ...defaultBiomicroscopyPosterior },
      },
      conclusion: {
        vision: null,
        cat: null,
        traitement: null,
        observation: null,
        //rv: false,
        //date_prochain_rendez_vous: null,
        diagnostic_cim_11: [],
      },
    },
    mode: 'onBlur',
  });

  // Charger les données de l'examen dans le formulaire
  useEffect(() => {
    if (examData) {
      // Mettre à jour le statut des sections en fonction des données existantes
      const hasTechnical = !!examData.technical_examen;
      const hasClinical = !!examData.clinical_examen;

      setSectionStatus({
        technical: {
          acuity: hasTechnical,
          refraction: hasTechnical,
          tension: hasTechnical,
          pachymetry: hasTechnical,
        },
        clinical: {
          plaintes: hasClinical,
          biomicroscopy: hasClinical,
          perimetry: hasClinical,
          attachments: (attachmentsData?.results?.length ?? 0) > 0,
        },
        conclusion: hasClinical,
      });

      // Charger les données techniques
      if (examData.technical_examen) {
        const tech = examData.technical_examen;
        const visualAcuity = mapVisualAcuityApiToForm(tech.visual_acuity);
        const refraction = mapRefractionApiToForm(tech.refraction);
        const ocularTension = mapOcularTensionApiToForm(tech.ocular_tension);
        const pachymetry = mapPachymetryApiToForm(tech.pachymetry);

        if (visualAcuity) form.setValue('visualAcuity', visualAcuity);
        if (refraction) form.setValue('refraction', refraction);
        if (ocularTension) form.setValue('ocularTension', ocularTension);
        if (pachymetry) form.setValue('pachymetry', pachymetry);
      }

      // Charger les données cliniques
      if (examData.clinical_examen) {
        const clin = examData.clinical_examen;
        const plaintes = mapPlaintesApiToForm(clin.plaintes);
        const perimetry = mapPerimetryApiToForm(clin.perimetry);
        const conclusion = mapConclusionApiToForm(clin.conclusion);

        if (plaintes) form.setValue('plaintes', plaintes);
        if (perimetry) form.setValue('perimetry', perimetry);

        if (clin.od) {
          const odAnterior = mapBiomicroscopyAnteriorApiToForm(
            clin.od.bp_sg_anterieur,
          );
          const odPosterior = mapBiomicroscopyPosteriorApiToForm(
            clin.od.bp_sg_posterieur,
          );
          if (odAnterior) form.setValue('od.bp_sg_anterieur', odAnterior);
          if (odPosterior) form.setValue('od.bp_sg_posterieur', odPosterior);
        }
        if (clin.og) {
          const ogAnterior = mapBiomicroscopyAnteriorApiToForm(
            clin.og.bp_sg_anterieur,
          );
          const ogPosterior = mapBiomicroscopyPosteriorApiToForm(
            clin.og.bp_sg_posterieur,
          );
          if (ogAnterior) form.setValue('og.bp_sg_anterieur', ogAnterior);
          if (ogPosterior) form.setValue('og.bp_sg_posterieur', ogPosterior);
        }
        if (conclusion) form.setValue('conclusion', conclusion);
      }
    }
  }, [examData, attachmentsData, form]);

  // =====================================================================
  // Handlers
  // =====================================================================

  const handleSaveTechnical = useCallback(() => {
    const formData = {
      visualAcuity: form.getValues('visualAcuity'),
      refraction: form.getValues('refraction'),
      ocularTension: form.getValues('ocularTension'),
      pachymetry: form.getValues('pachymetry'),
    };

    // Mapper les données du formulaire vers le format API
    // Les noms de champs sont convertis (ex: od_sphere → od_s)
    const apiData = mapTechnicalFormToApi(formData);

    addTechnical(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      { id: numericExamId, data: apiData as any },
      {
        onSuccess: () => {
          refetchExam();
          setSectionStatus((prev) => ({
            ...prev,
            technical: {
              acuity: true,
              refraction: true,
              tension: true,
              pachymetry: true,
            },
          }));
        },
      },
    );
  }, [addTechnical, form, numericExamId, refetchExam]);

  const handleSaveClinical = useCallback(() => {
    const data = {
      plaintes: form.getValues('plaintes'),
      perimetry: form.getValues('perimetry'),
      od: form.getValues('od'),
      og: form.getValues('og'),
      conclusion: form.getValues('conclusion'),
    };

    addClinical(
      { id: numericExamId, data },
      {
        onSuccess: () => {
          refetchExam();
          setSectionStatus((prev) => ({
            ...prev,
            clinical: {
              ...prev.clinical,
              plaintes: true,
              biomicroscopy: true,
              perimetry: true,
            },
            conclusion: true,
          }));
        },
      },
    );
  }, [addClinical, form, numericExamId, refetchExam]);

  const handleSaveSection = useCallback(
    (section: Section) => {
      if (section === 'technical') {
        handleSaveTechnical();
      } else if (section === 'clinical' || section === 'conclusion') {
        handleSaveClinical();
      }
    },
    [handleSaveTechnical, handleSaveClinical],
  );

  const handleFinalizeExam = useCallback(() => {
    setShowSaveDialog(false);
    completeExam(
      {
        id: numericExamId,
      },
      {
        onSuccess: () => {
          router.push(`/patients/${patient.id}`);
        },
      },
    );
  }, [completeExam, numericExamId, patient.id, router]);

  // Gestion des fichiers joints
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileDescription, setFileDescription] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleUploadFiles = useCallback(() => {
    if (!clinicalExamId || selectedFiles.length === 0) return;

    selectedFiles.forEach((file) => {
      uploadAttachment(
        {
          clinicalExamId,
          file,
          description: fileDescription || undefined,
        },
        {
          onSuccess: () => {
            refetchAttachments();
            setSelectedFiles([]);
            setFileDescription('');
            setSectionStatus((prev) => ({
              ...prev,
              clinical: { ...prev.clinical, attachments: true },
            }));
          },
        },
      );
    });
  }, [
    clinicalExamId,
    selectedFiles,
    fileDescription,
    uploadAttachment,
    refetchAttachments,
  ]);

  const handleDeleteAttachment = useCallback(
    (attachmentId: number) => {
      if (!clinicalExamId) return;
      deleteAttachment(
        { id: attachmentId, clinicalExamId },
        {
          onSuccess: () => {
            refetchAttachments();
          },
        },
      );
    },
    [deleteAttachment, refetchAttachments, clinicalExamId],
  );

  // Calcul de la progression
  const technicalCompleted = Object.values(sectionStatus.technical).filter(
    Boolean,
  ).length;
  const clinicalCompleted = Object.values(sectionStatus.clinical).filter(
    Boolean,
  ).length;
  const totalTechnical = 4;
  const totalClinical = 4;
  const isComplete = examData?.is_completed ?? false;
  const isSaving = isSavingTechnical || isSavingClinical;

  // =====================================================================
  // Loading & Error States
  // =====================================================================

  if (isLoadingExam && !isNewExam) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <div className="flex flex-1 items-center justify-center pl-60">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (isErrorExam && !isNewExam) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <div className="flex flex-1 flex-col items-center justify-center gap-4 pl-60">
            <AlertCircle className="size-12 text-destructive" />
            <p className="text-destructive">
              Erreur lors du chargement de l&apos;examen
            </p>
            <Button variant="outline" onClick={() => router.back()}>
              Retour
            </Button>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  // =====================================================================
  // Render
  // =====================================================================

  return (
    <SidebarProvider>
      <AdultExamContent
        examId={examId}
        numericExamId={numericExamId}
        isNewExam={isNewExam}
        patient={patient}
        form={form}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        technicalSubsection={technicalSubsection}
        setTechnicalSubsection={setTechnicalSubsection}
        clinicalSubsection={clinicalSubsection}
        setClinicalSubsection={setClinicalSubsection}
        showSaveDialog={showSaveDialog}
        setShowSaveDialog={setShowSaveDialog}
        sectionStatus={sectionStatus}
        handleSaveSection={handleSaveSection}
        handleFinalizeExam={handleFinalizeExam}
        technicalCompleted={technicalCompleted}
        clinicalCompleted={clinicalCompleted}
        totalTechnical={totalTechnical}
        totalClinical={totalClinical}
        isComplete={isComplete}
        isSaving={isSaving}
        isCompleting={isCompleting}
        // Attachments props
        clinicalExamId={clinicalExamId}
        attachments={attachmentsData?.results ?? []}
        isLoadingAttachments={isLoadingAttachments}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        fileDescription={fileDescription}
        setFileDescription={setFileDescription}
        handleFileSelect={handleFileSelect}
        handleUploadFiles={handleUploadFiles}
        handleDeleteAttachment={handleDeleteAttachment}
        isUploading={isUploading}
        isDeleting={isDeleting}
      />
    </SidebarProvider>
  );
}

// ==========================================================================
// INTERNAL COMPONENT
// ==========================================================================

interface AdultExamContentProps {
  examId: string;
  numericExamId: number;
  isNewExam: boolean;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    sex: string;
    medicalRecordNumber: string;
  };
  form: ReturnType<typeof useForm<AdultExamFormValues>>;
  activeSection: Section;
  setActiveSection: (s: Section) => void;
  technicalSubsection: TechnicalSubsection;
  setTechnicalSubsection: (s: TechnicalSubsection) => void;
  clinicalSubsection: ClinicalSubsection;
  setClinicalSubsection: (s: ClinicalSubsection) => void;
  showSaveDialog: boolean;
  setShowSaveDialog: (b: boolean) => void;
  sectionStatus: SectionStatus;
  handleSaveSection: (section: Section) => void;
  handleFinalizeExam: () => void;
  technicalCompleted: number;
  clinicalCompleted: number;
  totalTechnical: number;
  totalClinical: number;
  isComplete: boolean;
  isSaving: boolean;
  isCompleting: boolean;
  // Attachments
  clinicalExamId?: number;
  attachments: Array<{
    id: number;
    original_filename: string;
    file_size: number;
    description?: string | null;
    created: string;
  }>;
  isLoadingAttachments: boolean;
  selectedFiles: File[];
  setSelectedFiles: (files: File[]) => void;
  fileDescription: string;
  setFileDescription: (desc: string) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUploadFiles: () => void;
  handleDeleteAttachment: (id: number) => void;
  isUploading: boolean;
  isDeleting: boolean;
}

function AdultExamContent(props: AdultExamContentProps) {
  const {
    examId,
    isNewExam,
    patient,
    form,
    activeSection,
    setActiveSection,
    technicalSubsection,
    setTechnicalSubsection,
    clinicalSubsection,
    setClinicalSubsection,
    showSaveDialog,
    setShowSaveDialog,
    sectionStatus,
    handleSaveSection,
    handleFinalizeExam,
    technicalCompleted,
    clinicalCompleted,
    totalTechnical,
    totalClinical,
    isComplete,
    isSaving,
    isCompleting,
    clinicalExamId,
    attachments,
    isLoadingAttachments,
    selectedFiles,
    fileDescription,
    setFileDescription,
    handleFileSelect,
    handleUploadFiles,
    handleDeleteAttachment,
    isUploading,
    isDeleting,
  } = props;
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />

      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300',
          isCollapsed ? 'pl-16' : 'pl-60',
        )}
      >
        <Header
          title="Examen Adulte"
          patientName={`${patient.lastName}, ${patient.firstName}`}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Section Navigation */}
          <aside className="w-64 shrink-0 border-r border-border bg-card p-4">
            <div className="mb-4">
              <h2 className="text-sm font-semibold text-foreground">
                Sections
              </h2>
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
                    statusText = sectionStatus.conclusion
                      ? 'Complété'
                      : 'En attente';
                    if (sectionStatus.conclusion) {
                      statusIcon = <Check className="size-4 text-primary" />;
                    }
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
                        <span className="flex-1 text-left">
                          {section.title}
                        </span>
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
                <Badge variant={isComplete ? 'default' : 'outline'}>
                  {isComplete ? 'Terminé' : 'En cours'}
                </Badge>
              </div>
            </div>

            {/* Finalize Button */}
            <div className="mt-6">
              <Button
                className="w-full"
                onClick={() => setShowSaveDialog(true)}
                disabled={isComplete || isCompleting}
              >
                {isCompleting && (
                  <Loader2 className="mr-2 size-4 animate-spin" />
                )}
                {isComplete ? 'Examen terminé' : "Finaliser l'examen"}
              </Button>
              {!isComplete && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Complétez toutes les sections
                </p>
              )}
            </div>
          </aside>

          {/* Right: Active Section Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {/* Back Link */}
            <div className="mb-4">
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/patients/${patient.id}`}>
                  <ArrowLeft className="mr-1.5 size-4" aria-hidden="true" />
                  Retour au patient
                </Link>
              </Button>
            </div>

            {/* Exam Header */}
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-semibold text-foreground">
                    Examen Adulte
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {isNewExam ? 'Nouvel examen' : `Examen ID: ${examId}`}
                  </p>
                </div>
                <Badge variant={isComplete ? 'default' : 'secondary'}>
                  {isComplete ? 'Complet' : 'En cours'}
                </Badge>
              </div>
            </div>

            <FormProvider {...form}>
              {/* Technical Exam Section */}
              {activeSection === 'technical' && (
                <div className="rounded-lg border border-border bg-card">
                  <div className="border-b border-border p-4">
                    <h2 className="flex items-center gap-2 text-lg font-medium text-foreground">
                      <Eye className="size-5" aria-hidden="true" />
                      Examen Technique
                    </h2>
                  </div>

                  <Tabs
                    value={technicalSubsection}
                    onValueChange={(v) =>
                      setTechnicalSubsection(v as TechnicalSubsection)
                    }
                  >
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
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
                      <TabsTrigger
                        value="tension"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                      >
                        Tension Oculaire
                        {sectionStatus.technical.tension && (
                          <Check className="ml-1 size-3 text-primary" />
                        )}
                      </TabsTrigger>
                      <TabsTrigger
                        value="pachymetry"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary"
                      >
                        Pachymétrie
                        {sectionStatus.technical.pachymetry && (
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
                            <Save
                              className="mr-1.5 size-4"
                              aria-hidden="true"
                            />
                          )}
                          Sauvegarder
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="refraction" className="p-6">
                      <RefractionForm namePrefix="refraction" />
                      <div className="mt-6 flex justify-end border-t border-border pt-4">
                        <Button
                          type="button"
                          onClick={() => handleSaveSection('technical')}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="mr-1.5 size-4 animate-spin" />
                          ) : (
                            <Save
                              className="mr-1.5 size-4"
                              aria-hidden="true"
                            />
                          )}
                          Sauvegarder
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="tension" className="p-6">
                      <OcularTensionForm namePrefix="ocularTension" />
                      <div className="mt-6 flex justify-end border-t border-border pt-4">
                        <Button
                          type="button"
                          onClick={() => handleSaveSection('technical')}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="mr-1.5 size-4 animate-spin" />
                          ) : (
                            <Save
                              className="mr-1.5 size-4"
                              aria-hidden="true"
                            />
                          )}
                          Sauvegarder
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="pachymetry" className="p-6">
                      <PachymetryForm namePrefix="pachymetry" />
                      <div className="mt-6 flex justify-end border-t border-border pt-4">
                        <Button
                          type="button"
                          onClick={() => handleSaveSection('technical')}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="mr-1.5 size-4 animate-spin" />
                          ) : (
                            <Save
                              className="mr-1.5 size-4"
                              aria-hidden="true"
                            />
                          )}
                          Sauvegarder
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Clinical Exam Section */}
              {activeSection === 'clinical' && (
                <div className="rounded-lg border border-border bg-card">
                  <div className="border-b border-border p-4">
                    <h2 className="flex items-center gap-2 text-lg font-medium text-foreground">
                      <Stethoscope className="size-5" aria-hidden="true" />
                      Examen Clinique
                    </h2>
                  </div>

                  <Tabs
                    value={clinicalSubsection}
                    onValueChange={(v) =>
                      setClinicalSubsection(v as ClinicalSubsection)
                    }
                  >
                    <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
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
                        Périmétrie
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
                            <Save
                              className="mr-1.5 size-4"
                              aria-hidden="true"
                            />
                          )}
                          Sauvegarder
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="biomicroscopy"
                      className="space-y-8 p-6"
                    >
                      {/* Biomicroscopy with Eye Tabs */}
                      <Tabs defaultValue="od" className="w-full">
                        <TabsList className="mb-4 grid w-full grid-cols-2">
                          <TabsTrigger value="od">OD (Oeil Droit)</TabsTrigger>
                          <TabsTrigger value="og">OG (Oeil Gauche)</TabsTrigger>
                        </TabsList>

                        <TabsContent value="od" className="space-y-6">
                          <Tabs defaultValue="anterior">
                            <TabsList>
                              <TabsTrigger value="anterior">
                                Segment Antérieur
                              </TabsTrigger>
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
                              <TabsTrigger value="anterior">
                                Segment Antérieur
                              </TabsTrigger>
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
                            <Save
                              className="mr-1.5 size-4"
                              aria-hidden="true"
                            />
                          )}
                          Sauvegarder
                        </Button>
                      </div>
                    </TabsContent>

                    <TabsContent value="perimetry" className="p-6">
                      <PerimetryForm namePrefix="perimetry" />
                      <div className="mt-6 flex justify-end border-t border-border pt-4">
                        <Button
                          type="button"
                          onClick={() => handleSaveSection('clinical')}
                          disabled={isSaving}
                        >
                          {isSaving ? (
                            <Loader2 className="mr-1.5 size-4 animate-spin" />
                          ) : (
                            <Save
                              className="mr-1.5 size-4"
                              aria-hidden="true"
                            />
                          )}
                          Sauvegarder
                        </Button>
                      </div>
                    </TabsContent>

                    {/* NEW: Attachments Tab */}
                    <TabsContent value="attachments" className="p-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium text-foreground">
                            Fichiers joints
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Ajoutez des images ou documents liés à cet examen
                            clinique.
                          </p>
                        </div>

                        {/* Message si pas d'ID clinique */}
                        {!clinicalExamId && (
                          <div className="border-warning/30 bg-warning/10 flex items-center gap-3 rounded-lg border p-4">
                            <AlertCircle className="size-5 text-warning" />
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                Enregistrez d&apos;abord les données cliniques
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Vous devez sauvegarder les sections cliniques
                                avant de pouvoir ajouter des fichiers joints.
                              </p>
                            </div>
                          </div>
                        )}

                        {/* Upload Form */}
                        {clinicalExamId && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">
                                Ajouter des fichiers
                              </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="file-upload">
                                  Sélectionner des fichiers
                                </Label>
                                <Input
                                  id="file-upload"
                                  type="file"
                                  multiple
                                  accept="image/*,.pdf,.doc,.docx"
                                  onChange={handleFileSelect}
                                  className="cursor-pointer"
                                />
                              </div>

                              {selectedFiles.length > 0 && (
                                <div className="space-y-2">
                                  <Label>Fichiers sélectionnés</Label>
                                  <ul className="space-y-1">
                                    {selectedFiles.map((file, idx) => (
                                      <li
                                        key={idx}
                                        className="flex items-center gap-2 text-sm text-muted-foreground"
                                      >
                                        <Paperclip className="size-3" />
                                        {file.name} (
                                        {(file.size / 1024).toFixed(1)} Ko)
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              <div className="space-y-2">
                                <Label htmlFor="file-description">
                                  Description (optionnel)
                                </Label>
                                <Textarea
                                  id="file-description"
                                  value={fileDescription}
                                  onChange={(e) =>
                                    setFileDescription(e.target.value)
                                  }
                                  placeholder="Décrivez les fichiers..."
                                  rows={2}
                                />
                              </div>

                              <Button
                                type="button"
                                onClick={handleUploadFiles}
                                disabled={
                                  selectedFiles.length === 0 || isUploading
                                }
                              >
                                {isUploading ? (
                                  <Loader2 className="mr-1.5 size-4 animate-spin" />
                                ) : (
                                  <Upload className="mr-1.5 size-4" />
                                )}
                                Uploader les fichiers
                              </Button>
                            </CardContent>
                          </Card>
                        )}

                        {/* Liste des fichiers existants */}
                        {clinicalExamId && (
                          <Card>
                            <CardHeader>
                              <CardTitle className="text-base">
                                Fichiers existants
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              {isLoadingAttachments ? (
                                <div className="flex items-center justify-center py-8">
                                  <Loader2 className="size-6 animate-spin text-muted-foreground" />
                                </div>
                              ) : attachments.length === 0 ? (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                  Aucun fichier joint pour le moment.
                                </p>
                              ) : (
                                <ul className="space-y-3">
                                  {attachments.map((attachment) => (
                                    <li
                                      key={attachment.id}
                                      className="flex items-center justify-between rounded-lg border p-3"
                                    >
                                      <div className="flex items-center gap-3">
                                        <Paperclip className="size-4 text-muted-foreground" />
                                        <div>
                                          <p className="text-sm font-medium">
                                            {attachment.original_filename}
                                          </p>
                                          <p className="text-xs text-muted-foreground">
                                            {(
                                              attachment.file_size / 1024
                                            ).toFixed(1)}{' '}
                                            Ko
                                            {attachment.description &&
                                              ` • ${attachment.description}`}
                                          </p>
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() =>
                                          handleDeleteAttachment(attachment.id)
                                        }
                                        disabled={isDeleting}
                                      >
                                        {isDeleting ? (
                                          <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                          <Trash2 className="size-4 text-destructive" />
                                        )}
                                      </Button>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {/* Conclusion Section */}
              {activeSection === 'conclusion' && (
                <div className="rounded-lg border border-border bg-card p-6">
                  <ConclusionForm namePrefix="conclusion" />
                  <div className="mt-6 flex justify-end border-t border-border pt-4">
                    <Button
                      type="button"
                      onClick={() => handleSaveSection('conclusion')}
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
                </div>
              )}
            </FormProvider>
          </main>
        </div>
      </div>

      {/* Finalize Confirmation Dialog */}
      <AlertDialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finaliser l&apos;examen</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir finaliser cet examen ? L&apos;examen sera
              marqué comme terminé et les données ne pourront plus être
              modifiées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinalizeExam}
              disabled={isCompleting}
            >
              {isCompleting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Finaliser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
