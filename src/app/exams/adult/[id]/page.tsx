'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowLeft,
  Car,
  Eye,
  FileText,
  Loader2,
  Stethoscope,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { Header } from '@/components/layouts/header';
import { AppSidebar } from '@/components/layouts/sidebar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import {
  useDownloadAdultReport,
  useDownloadAdultConclusion,
} from '@/features/exams/api/adult/download-report';
import { useAdultExam } from '@/features/exams/api/adult/get-adult-exams';
import {
  useAddTechnicalData,
  useAddClinicalData,
  useCompleteAdultExam,
  useUncompleteAdultExam,
} from '@/features/exams/api/adult/mutations';
import { useAttachments } from '@/features/exams/api/attachments';
import {
  findOrdonnance,
  useDownloadOrdonnance,
  useExamOrdonnances,
} from '@/features/exams/api/ordonnances';
import { AdultExamClinicalPanel } from '@/features/exams/components/adult-exam-clinical-panel';
import { AdultExamConclusionPanel } from '@/features/exams/components/adult-exam-conclusion-panel';
import { AdultExamExperiencePanel } from '@/features/exams/components/adult-exam-experience-panel';
import { AdultExamFinalizeDialog } from '@/features/exams/components/adult-exam-finalize-dialog';
import { AdultExamSidebar } from '@/features/exams/components/adult-exam-sidebar';
import { AdultExamTechnicalPanel } from '@/features/exams/components/adult-exam-technical-panel';
import {
  type AdultExamForm,
  type AdultExamPatient,
  type SectionStatus,
} from '@/features/exams/components/adult-exam-types';
import {
  OrdonnanceFormDialog,
  type PrescriptionData,
} from '@/features/exams/components/ordonnance-form-dialog';
import {
  adultExamSchema,
  type AdultExamFormValues,
  type ClinicalSubsection,
  type Section,
  type TechnicalSubsection,
} from '@/features/exams/types/adult-exam';
import {
  defaultBiomicroscopyAnterior,
  defaultBiomicroscopyPosterior,
} from '@/features/exams/types/schemas';
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
} from '@/features/exams/utils/api-to-form-mappers';
import { hasFilledConclusion } from '@/features/exams/utils/conclusion-status';
import {
  mapTechnicalFormToApi,
  mapClinicalFormToApi,
} from '@/features/exams/utils/form-to-api-mappers';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  usePersistentLocalTabState,
  usePersistentTabState,
  useUrlParamMirror,
} from '@/hooks/use-persistent-tab-state';
import { useUser } from '@/lib/auth';
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

const BASE_SECTIONS = [
  { id: 'technical' as const, title: 'Examen Technique', icon: Eye },
  { id: 'clinical' as const, title: 'Examen Clinique', icon: Stethoscope },
  { id: 'conclusion' as const, title: 'Conclusion', icon: FileText },
];

// Valeurs autorisées (validation URL/localStorage — voir usePersistentTabState).
const SECTIONS_ALLOWED = ['technical', 'clinical', 'conclusion', 'experience'];
const TECHNICAL_SUBS = ['acuity', 'refraction', 'tension', 'pachymetry'];
const CLINICAL_SUBS = ['plaintes', 'biomicroscopy', 'perimetry', 'attachments'];

export default function AdultExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const isNewExam = examId === 'new';
  const numericExamId = isNewExam ? 0 : Number(examId);

  // Persistance section + sous-sections au reload (URL pour la section, et la
  // sous-section active reflétée dans ?sub= ; mémoire par section en localStorage).
  const examScope = `guiss.tab.exam.adult.${examId}`;
  const [activeSectionRaw, setActiveSection] = usePersistentTabState({
    paramKey: 'section',
    storageKey: `${examScope}.section`,
    defaultValue: 'technical',
    allowed: SECTIONS_ALLOWED,
  });
  const activeSection = activeSectionRaw as Section;
  const [technicalSubsectionRaw, setTechnicalSubsection] =
    usePersistentLocalTabState({
      storageKey: `${examScope}.technical.sub`,
      defaultValue: 'acuity',
      allowed: TECHNICAL_SUBS,
    });
  const technicalSubsection = technicalSubsectionRaw as TechnicalSubsection;
  const [clinicalSubsectionRaw, setClinicalSubsection] =
    usePersistentLocalTabState({
      storageKey: `${examScope}.clinical.sub`,
      defaultValue: 'plaintes',
      allowed: CLINICAL_SUBS,
    });
  const clinicalSubsection = clinicalSubsectionRaw as ClinicalSubsection;

  // Reflète la sous-section active dans l'URL (?sub=) et restaure depuis l'URL au montage.
  const activeSub =
    activeSection === 'technical'
      ? technicalSubsection
      : activeSection === 'clinical'
        ? clinicalSubsection
        : '';
  const initialSub = useUrlParamMirror('sub', activeSub);
  const subAppliedRef = useRef(false);
  useEffect(() => {
    if (subAppliedRef.current) return;
    subAppliedRef.current = true;
    if (!initialSub) return;
    if (activeSection === 'technical' && TECHNICAL_SUBS.includes(initialSub)) {
      setTechnicalSubsection(initialSub);
    } else if (
      activeSection === 'clinical' &&
      CLINICAL_SUBS.includes(initialSub)
    ) {
      setClinicalSubsection(initialSub);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
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

  const hasAnalyticsContext = !isNewExam && numericExamId > 0;

  // =====================================================================
  // API Hooks
  // =====================================================================

  // Récupérer les données de l'examen
  const {
    data: examData,
    isLoading: isLoadingExam,
    isError: isErrorExam,
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
  const { mutate: uncompleteExam, isPending: isUncompleting } =
    useUncompleteAdultExam();

  // Pièces jointes - utiliser l'ID de l'examen clinique (clinical_examen.id)
  const clinicalExamId = examData?.clinical_examen?.id;

  const { data: attachmentsData } = useAttachments({
    clinicalExamId: clinicalExamId ?? 0,
    enabled: !!clinicalExamId,
  });

  // Données patient depuis l'API
  const patient = examData?.patient
    ? {
        id: examData.patient.id.toString(),
        firstName: examData.patient.name,
        lastName: examData.patient.last_name,
        age: examData.patient.age,
        sex: examData.patient.sex === 'H' ? 'Homme' : 'Femme',
        medicalRecordNumber: examData.patient.numero_identifiant,
        hasDriver: examData.patient.has_driver ?? false,
        driverId: examData.patient.driver_id ?? null,
      }
    : {
        id: '',
        firstName: '',
        lastName: '',
        age: 0,
        sex: '',
        medicalRecordNumber: '',
        hasDriver: false,
        driverId: null,
      };

  // =====================================================================
  // Form Setup
  // =====================================================================

  const form = useForm<AdultExamFormValues>({
    resolver: zodResolver(adultExamSchema),
    defaultValues: {
      visualAcuity: {
        parinaud: null,
        correction: false,
        avsc_od: null,
        avsc_og: null,
        avsc_odg: null,
        avac_od: null,
        avac_og: null,
        avac_odg: null,
        avac_od_prescrite: null,
        avac_og_prescrite: null,
        avac_odg_prescrite: null,
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
        strabisme_type: null,
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
        examens_additionnels: [],
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
          attachments: (attachmentsData?.length ?? 0) > 0,
        },
        conclusion: hasFilledConclusion(examData.clinical_examen?.conclusion),
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
  }, [examData, attachmentsData, form, hasAnalyticsContext]);

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
      { id: numericExamId, data: apiData },
      {
        onSuccess: () => {
          // The mutation already invalidates the exam detail query
          // (['exams', 'adult', id]); no manual refetch needed.
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
  }, [addTechnical, form, numericExamId]);

  const handleSaveClinical = useCallback(() => {
    const data = {
      plaintes: form.getValues('plaintes'),
      perimetry: form.getValues('perimetry'),
      od: form.getValues('od'),
      og: form.getValues('og'),
      conclusion: form.getValues('conclusion'),
    };

    // Mapper les données du formulaire vers le format API
    const apiData = mapClinicalFormToApi(data);

    addClinical(
      { id: numericExamId, data: apiData },
      {
        onSuccess: () => {
          // The mutation already invalidates the exam detail query
          // (['exams', 'adult', id]); no manual refetch needed.
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
  }, [addClinical, form, numericExamId]);

  const handleSaveSection = useCallback(
    (section: Section) => {
      // Un examen finalisé est en lecture seule : il doit être explicitement
      // rouvert avant toute modification (intégrité du dossier médical).
      if (examData?.is_completed) {
        return;
      }
      if (section === 'technical') {
        handleSaveTechnical();
      } else if (section === 'clinical' || section === 'conclusion') {
        handleSaveClinical();
      }
    },
    [handleSaveTechnical, handleSaveClinical, examData?.is_completed],
  );

  const handleFinalizeExam = useCallback(() => {
    setShowSaveDialog(false);
    completeExam(
      {
        id: numericExamId,
      },
      {
        onSuccess: () => {
          if (patient.hasDriver && patient.driverId) {
            router.push(`/conducteurs/${patient.driverId}`);
          } else {
            router.push(`/patients/${patient.id}`);
          }
        },
      },
    );
  }, [
    completeExam,
    numericExamId,
    patient.id,
    patient.hasDriver,
    patient.driverId,
    router,
  ]);

  const handleUncompleteExam = useCallback(() => {
    uncompleteExam({ id: numericExamId });
  }, [uncompleteExam, numericExamId]);

  // Marque la sous-section "pièces jointes" comme complétée après un upload.
  const handleAttachmentUploaded = useCallback(() => {
    setSectionStatus((prev) => ({
      ...prev,
      clinical: { ...prev.clinical, attachments: true },
    }));
  }, []);

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
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 items-center justify-center">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (isErrorExam && !isNewExam) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <AlertCircle className="size-12 text-destructive" />
            <p className="text-destructive">
              Erreur lors du chargement de l&apos;examen
            </p>
            <Button variant="outline" onClick={() => router.back()}>
              Retour
            </Button>
          </div>
        </SidebarInset>
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
        handleUncompleteExam={handleUncompleteExam}
        technicalCompleted={technicalCompleted}
        clinicalCompleted={clinicalCompleted}
        totalTechnical={totalTechnical}
        totalClinical={totalClinical}
        isComplete={isComplete}
        isSaving={isSaving}
        isCompleting={isCompleting}
        isUncompleting={isUncompleting}
        // Attachments
        clinicalExamId={clinicalExamId}
        onUploaded={handleAttachmentUploaded}
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
  patient: AdultExamPatient;
  form: AdultExamForm;
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
  handleUncompleteExam: () => void;
  technicalCompleted: number;
  clinicalCompleted: number;
  totalTechnical: number;
  totalClinical: number;
  isComplete: boolean;
  isSaving: boolean;
  isCompleting: boolean;
  isUncompleting: boolean;
  // Attachments
  clinicalExamId?: number;
  onUploaded?: () => void;
}

function AdultExamContent(props: AdultExamContentProps) {
  const {
    examId,
    numericExamId,
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
    handleUncompleteExam,
    technicalCompleted,
    clinicalCompleted,
    totalTechnical,
    totalClinical,
    isComplete,
    isSaving,
    isCompleting,
    isUncompleting,
    clinicalExamId,
    onUploaded,
  } = props;

  const { mutate: downloadReport, isPending: isDownloadingReport } =
    useDownloadAdultReport();
  const { mutate: downloadConclusion, isPending: isDownloadingConclusion } =
    useDownloadAdultConclusion();

  const { data: ordonnancesList } = useExamOrdonnances('adult', numericExamId);
  const medicamentOrdonnance = findOrdonnance(
    ordonnancesList,
    'MEDICAMENTEUSE',
  );
  const optiqueOrdonnance = findOrdonnance(ordonnancesList, 'OPTIQUE');
  const { mutate: downloadOrdonnance } = useDownloadOrdonnance();

  const { user: currentUser } = useUser();
  const canGenerateOrdonnance =
    currentUser?.role === 'DOCTEUR' ||
    currentUser?.role === 'ADMIN' ||
    currentUser?.role === 'SUPERUSER';

  const [medicamentDialogOpen, setMedicamentDialogOpen] = useState(false);
  const [optiqueDialogOpen, setOptiqueDialogOpen] = useState(false);

  const isMobile = useIsMobile();

  const sections = [
    ...BASE_SECTIONS,
    ...(patient.hasDriver
      ? [{ id: 'experience' as const, title: 'Expérience conduite', icon: Car }]
      : []),
  ];

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <Header
          title="Examen Adulte"
          patientName={`${patient.lastName}, ${patient.firstName}`}
        />

        <div className="flex flex-1 overflow-hidden">
          <OrdonnanceFormDialog
            examId={numericExamId}
            examType="adult"
            mode="medicamenteuse"
            open={medicamentDialogOpen}
            onClose={() => setMedicamentDialogOpen(false)}
            initialData={
              (medicamentOrdonnance?.prescription_data as PrescriptionData) ??
              null
            }
          />
          <OrdonnanceFormDialog
            examId={numericExamId}
            examType="adult"
            mode="optique"
            open={optiqueDialogOpen}
            onClose={() => setOptiqueDialogOpen(false)}
            initialData={
              (optiqueOrdonnance?.prescription_data as PrescriptionData) ?? null
            }
          />

          <ResizablePanelGroup
            direction="horizontal"
            autoSaveId="guiss.exam.adult.layout"
            className="flex-1"
          >
            {!isMobile && (
              <>
                {/* Left: Section Navigation */}
                <ResizablePanel
                  id="nav"
                  order={1}
                  defaultSize={20}
                  minSize={14}
                  maxSize={32}
                  className="min-w-0"
                >
                  <AdultExamSidebar
                    examId={examId}
                    patient={patient}
                    sections={sections}
                    activeSection={activeSection}
                    setActiveSection={setActiveSection}
                    sectionStatus={sectionStatus}
                    technicalCompleted={technicalCompleted}
                    clinicalCompleted={clinicalCompleted}
                    totalTechnical={totalTechnical}
                    totalClinical={totalClinical}
                    isComplete={isComplete}
                    isCompleting={isCompleting}
                    isUncompleting={isUncompleting}
                    setShowSaveDialog={setShowSaveDialog}
                    handleUncompleteExam={handleUncompleteExam}
                    isDownloadingReport={isDownloadingReport}
                    isDownloadingConclusion={isDownloadingConclusion}
                    downloadReport={downloadReport}
                    downloadConclusion={downloadConclusion}
                    canGenerateOrdonnance={canGenerateOrdonnance}
                    medicamentOrdonnance={medicamentOrdonnance}
                    optiqueOrdonnance={optiqueOrdonnance}
                    setMedicamentDialogOpen={setMedicamentDialogOpen}
                    setOptiqueDialogOpen={setOptiqueDialogOpen}
                    downloadOrdonnance={downloadOrdonnance}
                  />
                </ResizablePanel>
                <ResizableHandle withHandle />
              </>
            )}

            {/* Right: Active Section Content */}
            <ResizablePanel
              id="content"
              order={2}
              defaultSize={80}
              minSize={50}
              className="min-w-0"
            >
              <main className="size-full overflow-y-auto p-6">
                {/* Mobile section nav — hidden on md+ */}
                <div className="mb-4 flex overflow-x-auto rounded-lg border bg-card md:hidden">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      type="button"
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        'flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium',
                        activeSection === section.id
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted-foreground hover:text-foreground',
                      )}
                    >
                      <section.icon className="size-4" aria-hidden="true" />
                      {section.title}
                    </button>
                  ))}
                </div>

                {/* Back Link */}
                <div className="mb-4">
                  <Button variant="ghost" size="sm" asChild>
                    <Link
                      href={
                        patient.hasDriver && patient.driverId
                          ? `/conducteurs/${patient.driverId}`
                          : `/patients/${patient.id}`
                      }
                    >
                      <ArrowLeft className="mr-1.5 size-4" aria-hidden="true" />
                      {patient.hasDriver
                        ? 'Retour au conducteur'
                        : 'Retour au patient'}
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

                {/* Examen finalisé = lecture seule tant qu'il n'est pas rouvert */}
                {isComplete && (
                  <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
                    <AlertCircle
                      className="size-4 shrink-0"
                      aria-hidden="true"
                    />
                    <p>
                      Examen finalisé — lecture seule. Utilisez «&nbsp;Rouvrir
                      l&apos;examen&nbsp;» dans la barre latérale pour le
                      modifier.
                    </p>
                  </div>
                )}

                <fieldset disabled={isComplete} className="min-w-0">
                  <FormProvider {...form}>
                    {/* Technical Exam Section */}
                    {activeSection === 'technical' && (
                      <AdultExamTechnicalPanel
                        examId={examId}
                        technicalSubsection={technicalSubsection}
                        setTechnicalSubsection={setTechnicalSubsection}
                        sectionStatus={sectionStatus}
                        handleSaveSection={handleSaveSection}
                        isSaving={isSaving}
                      />
                    )}

                    {/* Clinical Exam Section */}
                    {activeSection === 'clinical' && (
                      <AdultExamClinicalPanel
                        clinicalSubsection={clinicalSubsection}
                        setClinicalSubsection={setClinicalSubsection}
                        sectionStatus={sectionStatus}
                        handleSaveSection={handleSaveSection}
                        isSaving={isSaving}
                        clinicalExamId={clinicalExamId}
                        onUploaded={onUploaded}
                      />
                    )}

                    {/* Conclusion Section */}
                    {activeSection === 'conclusion' && (
                      <AdultExamConclusionPanel
                        handleSaveSection={handleSaveSection}
                        isSaving={isSaving}
                        isDriver={patient.hasDriver}
                      />
                    )}
                  </FormProvider>

                  {/* Driver Experience Section — outside FormProvider, standalone form */}
                  {activeSection === 'experience' && patient.hasDriver && (
                    <AdultExamExperiencePanel numericExamId={numericExamId} />
                  )}
                </fieldset>
              </main>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </SidebarInset>

      {/* Finalize Confirmation Dialog */}
      <AdultExamFinalizeDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        handleFinalizeExam={handleFinalizeExam}
        isCompleting={isCompleting}
      />
    </>
  );
}
