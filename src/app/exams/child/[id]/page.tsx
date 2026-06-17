'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ClipboardList,
  Eye,
  FileText,
  Loader2,
  Stethoscope,
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { Header } from '@/components/layouts/header';
import { AppSidebar } from '@/components/layouts/sidebar';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/components/ui/notifications';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import {
  useAttachments,
  useUploadAttachment,
  useDeleteAttachment,
  downloadAttachment,
} from '@/features/exams/api/attachments';
import {
  useDownloadChildReport,
  useDownloadChildConclusion,
} from '@/features/exams/api/child/download-report';
import { useChildExam } from '@/features/exams/api/child/get-child-exams';
import {
  useUpdateTechnicalData,
  useUpdateClinicalData,
  useCompleteChildExam,
  useUncompleteChildExam,
} from '@/features/exams/api/child/mutations';
import {
  findOrdonnance,
  useDownloadOrdonnance,
  useExamOrdonnances,
} from '@/features/exams/api/ordonnances';
import { ChildExamClinicalPanel } from '@/features/exams/components/child-exam-clinical-panel';
import {
  ChildExamComplementaryPanel,
  type ChildExamAttachment,
} from '@/features/exams/components/child-exam-complementary-panel';
import { ChildExamConclusionPanel } from '@/features/exams/components/child-exam-conclusion-panel';
import { ChildExamDialogs } from '@/features/exams/components/child-exam-dialogs';
import { ChildExamSidebar } from '@/features/exams/components/child-exam-sidebar';
import { ChildExamTechnicalPanel } from '@/features/exams/components/child-exam-technical-panel';
import {
  OrdonnanceFormDialog,
  type PrescriptionData,
} from '@/features/exams/components/ordonnance-form-dialog';
import {
  childExamSchema,
  type ChildExamFormValues,
} from '@/features/exams/types/child-exam';
import {
  defaultBiomicroscopyAnterior,
  defaultBiomicroscopyPosterior,
} from '@/features/exams/types/schemas';
import {
  mapBiomicroscopyAnteriorApiToForm,
  mapBiomicroscopyPosteriorApiToForm,
  mapClinicalCheckChildApiToForm,
  mapConclusionApiToForm,
  mapOcularTensionApiToForm,
  mapPerimetryApiToForm,
  mapPlaintesApiToForm,
  mapRefractionApiToForm,
  mapVisualAcuityApiToForm,
  mapVisionBinoculaireApiToForm,
} from '@/features/exams/utils/api-to-form-mappers';
import { hasFilledConclusion } from '@/features/exams/utils/conclusion-status';
import {
  mapBiomicroscopyAnteriorFormToApi,
  mapBiomicroscopyPosteriorFormToApi,
  mapConclusionFormToApi,
  mapOcularTensionFormToApi,
  mapPerimetryFormToApi,
  mapPlaintesFormToApi,
  mapRefractionFormToApi,
  mapVisualAcuityFormToApi,
} from '@/features/exams/utils/form-to-api-mappers';
import { useUser } from '@/lib/auth';

type Section = 'technical' | 'clinical' | 'complementary' | 'conclusion';
type TechnicalSubsection = 'acuity' | 'refraction' | 'tension';
type ClinicalSubsection = 'visionBinoculaire' | 'clinicalCheck';
type ComplementarySubsection =
  | 'plaintes'
  | 'biomicroscopy'
  | 'perimetry'
  | 'attachments';

interface SectionStatus {
  technical: boolean;
  clinical: boolean;
  complementary: boolean;
  conclusion: boolean;
}

const sections = [
  { id: 'technical' as const, title: 'Technique', icon: Eye },
  { id: 'clinical' as const, title: 'Clinique', icon: Stethoscope },
  {
    id: 'complementary' as const,
    title: 'Complémentaires',
    icon: ClipboardList,
  },
  { id: 'conclusion' as const, title: 'Conclusion', icon: FileText },
];

export default function ChildExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const isNewExam = examId === 'new';
  const numericExamId = isNewExam ? 0 : Number(examId);

  const [activeSection, setActiveSection] = useState<Section>('technical');
  const [technicalSubsection, setTechnicalSubsection] =
    useState<TechnicalSubsection>('acuity');
  const [clinicalSubsection, setClinicalSubsection] =
    useState<ClinicalSubsection>('visionBinoculaire');
  const [complementarySubsection, setComplementarySubsection] =
    useState<ComplementarySubsection>('plaintes');
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [sectionStatus, setSectionStatus] = useState<SectionStatus>({
    technical: false,
    clinical: false,
    complementary: false,
    conclusion: false,
  });

  const {
    data: examData,
    isLoading: isLoadingExam,
    isError: isErrorExam,
    refetch: refetchExam,
  } = useChildExam({
    id: numericExamId,
    enabled: !isNewExam && numericExamId > 0,
  });

  const [simplifiedClinicalExam, setSimplifiedClinicalExam] = useState(false);

  // Sync toggle from server data on load
  useEffect(() => {
    if (examData) {
      setSimplifiedClinicalExam(examData.simplified_clinical_exam ?? false);
    }
  }, [examData]);

  const { mutate: saveTechnical, isPending: isSavingTechnical } =
    useUpdateTechnicalData();
  const { mutate: saveClinical, isPending: isSavingClinical } =
    useUpdateClinicalData();

  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false);
  const isComplete = examData?.is_completed ?? false;

  const { mutate: finalizeExam, isPending: isCompleting } =
    useCompleteChildExam({
      mutationConfig: {
        onSuccess: () => setShowFinalizeDialog(false),
      },
    });

  const { mutate: uncompleteExam, isPending: isUncompleting } =
    useUncompleteChildExam();

  const handleFinalizeExam = useCallback(() => {
    if (numericExamId > 0) finalizeExam({ id: numericExamId });
  }, [finalizeExam, numericExamId]);

  const handleUncompleteExam = useCallback(() => {
    if (numericExamId > 0) uncompleteExam({ id: numericExamId });
  }, [uncompleteExam, numericExamId]);

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
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const handleToggleSimplifiedClinicalExam = useCallback(
    (enabled: boolean) => {
      setSimplifiedClinicalExam(enabled);
      if (!enabled) {
        // Immediately persist the OFF state so the backend clears the ClinicalExamen
        saveClinical(
          { id: numericExamId, data: { simplified_clinical_exam: false } },
          {
            onSuccess: () => {
              refetchExam();
              setSectionStatus((prev) => ({
                ...prev,
                complementary: false,
                conclusion: false,
              }));
              setActiveSection('clinical');
            },
          },
        );
      }
    },
    [saveClinical, numericExamId, refetchExam],
  );

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

  const form = useForm<ChildExamFormValues>({
    resolver: zodResolver(childExamSchema),
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
        correction: false,
        od_sphere_avec_correction: null,
        od_cylinder_avec_correction: null,
        od_axis_avec_correction: null,
        og_sphere_avec_correction: null,
        og_cylinder_avec_correction: null,
        og_axis_avec_correction: null,
        od_visual_acuity_avec_correction: null,
        og_visual_acuity_avec_correction: null,
        odg_visual_acuity_avec_correction: null,
      },
      ocularTension: { od: null, og: null },
      visionBinoculaire: {
        hirschberg_type: null,
        hirschberg_detail: null,
        stereoscopy_lang: null,
        pupillary_reflex: null,
        pupillary_reflex_laterality: null,
        cover_test_vl_type: null,
        cover_test_vl_direction: null,
        cover_test_vp_type: null,
        cover_test_vp_direction: null,
      },
      clinicalCheck: {
        reflet_pupillaire: null,
        reflet_pupillaire_detail: null,
        fond_oeil: null,
        fo_detail: null,
      },
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

  useEffect(() => {
    if (examData) {
      const hasTechnical = !!(
        examData.visual_acuity ||
        examData.refraction ||
        examData.ocular_tension
      );
      const hasClinical = !!(
        examData.reflet_pupillaire ||
        examData.fo ||
        examData.vision_binoculaire
      );
      const hasComplementary = !!examData.clinical_examen;
      const hasConclusion = hasFilledConclusion(
        examData.clinical_examen?.conclusion,
      );

      setSectionStatus({
        technical: hasTechnical,
        clinical: hasClinical,
        complementary: hasComplementary,
        conclusion: hasConclusion,
      });

      if (examData.visual_acuity) {
        const v = mapVisualAcuityApiToForm(examData.visual_acuity);
        if (v) form.setValue('visualAcuity', v);
      }
      if (examData.refraction) {
        const r = mapRefractionApiToForm(examData.refraction);
        if (r) form.setValue('refraction', r);
      }
      if (examData.ocular_tension) {
        const t = mapOcularTensionApiToForm(examData.ocular_tension);
        if (t) form.setValue('ocularTension', t);
      }
      if (examData.vision_binoculaire) {
        const vb = mapVisionBinoculaireApiToForm(examData.vision_binoculaire);
        if (vb) form.setValue('visionBinoculaire', vb);
      }
      if (
        examData.reflet_pupillaire !== undefined ||
        examData.fo !== undefined
      ) {
        const cc = mapClinicalCheckChildApiToForm({
          reflet_pupillaire: examData.reflet_pupillaire,
          reflet_pupillaire_detail: examData.reflet_pupillaire_detail,
          fo: examData.fo,
          fo_detail: examData.fo_detail,
        });
        if (cc) form.setValue('clinicalCheck', cc);
      }
      if (examData.clinical_examen) {
        const clin = examData.clinical_examen;
        const plaintes = mapPlaintesApiToForm(clin.plaintes);
        const perimetry = mapPerimetryApiToForm(clin.perimetry);
        const conclusion = mapConclusionApiToForm(clin.conclusion);
        if (plaintes) form.setValue('plaintes', plaintes);
        if (perimetry) form.setValue('perimetry', perimetry);
        if (conclusion) form.setValue('conclusion', conclusion);
        if (clin.od) {
          const odA = mapBiomicroscopyAnteriorApiToForm(
            clin.od.bp_sg_anterieur,
          );
          const odP = mapBiomicroscopyPosteriorApiToForm(
            clin.od.bp_sg_posterieur,
          );
          if (odA) form.setValue('od.bp_sg_anterieur', odA);
          if (odP) form.setValue('od.bp_sg_posterieur', odP);
        }
        if (clin.og) {
          const ogA = mapBiomicroscopyAnteriorApiToForm(
            clin.og.bp_sg_anterieur,
          );
          const ogP = mapBiomicroscopyPosteriorApiToForm(
            clin.og.bp_sg_posterieur,
          );
          if (ogA) form.setValue('og.bp_sg_anterieur', ogA);
          if (ogP) form.setValue('og.bp_sg_posterieur', ogP);
        }
      }
    }
  }, [examData, form]);

  const buildVisionBinoculairePayload = useCallback(
    (vb: ChildExamFormValues['visionBinoculaire']) => {
      const pupillaryReflex = vb.pupillary_reflex;
      const needsDetail = pupillaryReflex && pupillaryReflex !== 'rouge';
      const payload: Record<string, unknown> = {
        hirschberg_type: vb.hirschberg_type,
        hirschberg_detail: vb.hirschberg_detail,
        stereoscopie_lang_ii: vb.stereoscopy_lang,
        cover_vl_type: vb.cover_test_vl_type,
        cover_vl_direction: vb.cover_test_vl_direction,
        cover_vp_type: vb.cover_test_vp_type,
        cover_vp_direction: vb.cover_test_vp_direction,
      };
      if (pupillaryReflex) {
        payload.reflet_pupillaire = pupillaryReflex;
        if (needsDetail) {
          payload.reflet_pupillaire_detail = null;
          payload.reflet_lateralite = vb.pupillary_reflex_laterality;
        }
      }
      return payload;
    },
    [],
  );

  const handleSaveTechnical = useCallback(() => {
    const values = form.getValues();
    saveTechnical(
      {
        id: numericExamId,
        data: {
          visual_acuity: mapVisualAcuityFormToApi(values.visualAcuity),
          refraction: mapRefractionFormToApi(values.refraction),
          ocular_tension: mapOcularTensionFormToApi(values.ocularTension),
        },
      },
      {
        onSuccess: () => {
          refetchExam();
          setSectionStatus((prev) => ({ ...prev, technical: true }));
        },
      },
    );
  }, [saveTechnical, form, numericExamId, refetchExam]);

  const handleSaveClinical = useCallback(() => {
    const values = form.getValues();
    // Save VB + reflet/FO fields to technical endpoint, simplified flag to clinical endpoint
    saveTechnical(
      {
        id: numericExamId,
        data: {
          vision_binoculaire: buildVisionBinoculairePayload(
            values.visionBinoculaire,
          ),
          reflet_pupillaire: values.clinicalCheck.reflet_pupillaire,
          reflet_pupillaire_detail:
            values.clinicalCheck.reflet_pupillaire_detail,
          fo: values.clinicalCheck.fond_oeil,
          fo_detail: values.clinicalCheck.fo_detail,
        },
      },
      {
        onSuccess: () => {
          saveClinical(
            {
              id: numericExamId,
              data: {
                simplified_clinical_exam: simplifiedClinicalExam,
              },
            },
            {
              onSuccess: () => {
                refetchExam();
                setSectionStatus((prev) => ({ ...prev, clinical: true }));
              },
            },
          );
        },
      },
    );
  }, [
    saveTechnical,
    saveClinical,
    form,
    numericExamId,
    simplifiedClinicalExam,
    buildVisionBinoculairePayload,
    refetchExam,
  ]);

  const handleSaveComplementary = useCallback(() => {
    const values = form.getValues();
    saveClinical(
      {
        id: numericExamId,
        data: {
          simplified_clinical_exam: true,
          plaintes: mapPlaintesFormToApi(values.plaintes),
          perimetry: mapPerimetryFormToApi(values.perimetry),
          biomicro_ant_od: mapBiomicroscopyAnteriorFormToApi(
            values.od.bp_sg_anterieur,
          ),
          biomicro_post_od: mapBiomicroscopyPosteriorFormToApi(
            values.od.bp_sg_posterieur,
          ),
          biomicro_ant_og: mapBiomicroscopyAnteriorFormToApi(
            values.og.bp_sg_anterieur,
          ),
          biomicro_post_og: mapBiomicroscopyPosteriorFormToApi(
            values.og.bp_sg_posterieur,
          ),
        },
      },
      {
        onSuccess: () => {
          refetchExam();
          setSectionStatus((prev) => ({ ...prev, complementary: true }));
        },
      },
    );
  }, [saveClinical, form, numericExamId, refetchExam]);

  const handleSaveConclusion = useCallback(() => {
    const values = form.getValues();
    saveClinical(
      {
        id: numericExamId,
        data: {
          simplified_clinical_exam: true,
          conclusion: mapConclusionFormToApi(values.conclusion),
        },
      },
      {
        onSuccess: () => {
          refetchExam();
          setSectionStatus((prev) => ({ ...prev, conclusion: true }));
          setShowSaveDialog(false);
        },
      },
    );
  }, [saveClinical, form, numericExamId, refetchExam]);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [fileDescription, setFileDescription] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setSelectedFiles(Array.from(e.target.files));
  };

  const handleUploadFiles = useCallback(() => {
    if (!clinicalExamId || selectedFiles.length === 0) return;
    selectedFiles.forEach((file) => {
      uploadAttachment(
        { clinicalExamId, file, description: fileDescription || undefined },
        {
          onSuccess: () => {
            refetchAttachments();
            setSelectedFiles([]);
            setFileDescription('');
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
    (id: number) => {
      if (!clinicalExamId) return;
      deleteAttachment(
        { id, clinicalExamId },
        { onSuccess: () => refetchAttachments() },
      );
    },
    [deleteAttachment, refetchAttachments, clinicalExamId],
  );

  const handleDownloadAttachment = async (id: number, filename: string) => {
    try {
      setDownloadingId(id);
      const { url } = await downloadAttachment(id);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch {
      useNotifications.getState().addNotification({
        type: 'error',
        title: 'Téléchargement impossible',
        message:
          'Impossible de télécharger le fichier joint. Veuillez réessayer.',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  const isSaving = isSavingTechnical || isSavingClinical;

  if (isLoadingExam && !isNewExam) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </SidebarInset>
      </SidebarProvider>
    );
  }

  if (isErrorExam && !isNewExam) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="flex flex-col items-center justify-center gap-4">
          <AlertCircle className="size-12 text-destructive" />
          <p className="text-destructive">
            Erreur lors du chargement de l&apos;examen
          </p>
          <Button variant="outline" onClick={() => router.back()}>
            Retour
          </Button>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <ChildExamContent
        examId={examId}
        numericExamId={numericExamId}
        patient={patient}
        form={form}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        technicalSubsection={technicalSubsection}
        setTechnicalSubsection={setTechnicalSubsection}
        clinicalSubsection={clinicalSubsection}
        setClinicalSubsection={setClinicalSubsection}
        complementarySubsection={complementarySubsection}
        setComplementarySubsection={setComplementarySubsection}
        showSaveDialog={showSaveDialog}
        setShowSaveDialog={setShowSaveDialog}
        sectionStatus={sectionStatus}
        handleSaveTechnical={handleSaveTechnical}
        handleSaveClinical={handleSaveClinical}
        handleSaveComplementary={handleSaveComplementary}
        handleSaveConclusion={handleSaveConclusion}
        isSaving={isSaving}
        clinicalExamId={clinicalExamId}
        attachments={attachmentsData ?? []}
        isLoadingAttachments={isLoadingAttachments}
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
        fileDescription={fileDescription}
        setFileDescription={setFileDescription}
        handleFileSelect={handleFileSelect}
        handleUploadFiles={handleUploadFiles}
        handleDeleteAttachment={handleDeleteAttachment}
        handleDownloadAttachment={handleDownloadAttachment}
        isUploading={isUploading}
        isDeleting={isDeleting}
        downloadingId={downloadingId}
        simplifiedClinicalExam={simplifiedClinicalExam}
        onToggleSimplifiedClinicalExam={handleToggleSimplifiedClinicalExam}
        isComplete={isComplete}
        isCompleting={isCompleting}
        isUncompleting={isUncompleting}
        showFinalizeDialog={showFinalizeDialog}
        setShowFinalizeDialog={setShowFinalizeDialog}
        handleFinalizeExam={handleFinalizeExam}
        handleUncompleteExam={handleUncompleteExam}
      />
    </SidebarProvider>
  );
}

// ==========================================================================
// INNER COMPONENT
// ==========================================================================

interface ChildExamContentProps {
  examId: string;
  numericExamId: number;
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    sex: string;
    medicalRecordNumber: string;
  };
  form: ReturnType<typeof useForm<ChildExamFormValues>>;
  activeSection: Section;
  setActiveSection: (s: Section) => void;
  technicalSubsection: TechnicalSubsection;
  setTechnicalSubsection: (s: TechnicalSubsection) => void;
  clinicalSubsection: ClinicalSubsection;
  setClinicalSubsection: (s: ClinicalSubsection) => void;
  complementarySubsection: ComplementarySubsection;
  setComplementarySubsection: (s: ComplementarySubsection) => void;
  showSaveDialog: boolean;
  setShowSaveDialog: (b: boolean) => void;
  sectionStatus: SectionStatus;
  handleSaveTechnical: () => void;
  handleSaveClinical: () => void;
  handleSaveComplementary: () => void;
  handleSaveConclusion: () => void;
  isSaving: boolean;
  clinicalExamId?: number;
  attachments: ChildExamAttachment[];
  isLoadingAttachments: boolean;
  selectedFiles: File[];
  setSelectedFiles: (f: File[]) => void;
  fileDescription: string;
  setFileDescription: (d: string) => void;
  handleFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUploadFiles: () => void;
  handleDeleteAttachment: (id: number) => void;
  handleDownloadAttachment: (id: number, filename: string) => void;
  isUploading: boolean;
  isDeleting: boolean;
  downloadingId: number | null;
  simplifiedClinicalExam: boolean;
  onToggleSimplifiedClinicalExam: (enabled: boolean) => void;
  isComplete: boolean;
  isCompleting: boolean;
  isUncompleting: boolean;
  showFinalizeDialog: boolean;
  setShowFinalizeDialog: (b: boolean) => void;
  handleFinalizeExam: () => void;
  handleUncompleteExam: () => void;
}

function ChildExamContent(props: ChildExamContentProps) {
  const {
    examId,
    numericExamId,
    patient,
    form,
    activeSection,
    setActiveSection,
    technicalSubsection,
    setTechnicalSubsection,
    clinicalSubsection,
    setClinicalSubsection,
    complementarySubsection,
    setComplementarySubsection,
    showSaveDialog,
    setShowSaveDialog,
    sectionStatus,
    handleSaveTechnical,
    handleSaveClinical,
    handleSaveComplementary,
    handleSaveConclusion,
    isSaving,
    clinicalExamId,
    attachments,
    isLoadingAttachments,
    selectedFiles,
    fileDescription,
    setFileDescription,
    handleFileSelect,
    handleUploadFiles,
    handleDeleteAttachment,
    handleDownloadAttachment,
    isUploading,
    isDeleting,
    downloadingId,
    simplifiedClinicalExam,
    onToggleSimplifiedClinicalExam,
    isComplete,
    isCompleting,
    isUncompleting,
    showFinalizeDialog,
    setShowFinalizeDialog,
    handleFinalizeExam,
    handleUncompleteExam,
  } = props;

  const visibleSections = sections.filter(
    (s) =>
      simplifiedClinicalExam ||
      (s.id !== 'complementary' && s.id !== 'conclusion'),
  );
  const completedCount = visibleSections.filter(
    (s) => sectionStatus[s.id],
  ).length;
  const totalCount = visibleSections.length;

  const { mutate: downloadReport, isPending: isDownloadingReport } =
    useDownloadChildReport();
  const { mutate: downloadConclusion, isPending: isDownloadingConclusion } =
    useDownloadChildConclusion();

  const { data: ordonnancesList } = useExamOrdonnances('child', numericExamId);
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

  const handleSaveSection = () => {
    if (activeSection === 'technical') handleSaveTechnical();
    else if (activeSection === 'clinical') handleSaveClinical();
    else if (activeSection === 'complementary') handleSaveComplementary();
    else if (activeSection === 'conclusion') setShowSaveDialog(true);
  };

  return (
    <>
      <AppSidebar />

      <SidebarInset>
        <Header
          title="Examen Enfant"
          patientName={`${patient.lastName}, ${patient.firstName}`}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Section Navigation */}
          <ChildExamSidebar
            examId={examId}
            patient={patient}
            visibleSections={visibleSections}
            completedCount={completedCount}
            totalCount={totalCount}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            sectionStatus={sectionStatus}
            handleSaveSection={handleSaveSection}
            isSaving={isSaving}
            isComplete={isComplete}
            isCompleting={isCompleting}
            isUncompleting={isUncompleting}
            setShowFinalizeDialog={setShowFinalizeDialog}
            handleUncompleteExam={handleUncompleteExam}
            isDownloadingReport={isDownloadingReport}
            downloadReport={downloadReport}
            isDownloadingConclusion={isDownloadingConclusion}
            downloadConclusion={downloadConclusion}
            canGenerateOrdonnance={canGenerateOrdonnance}
            medicamentOrdonnance={medicamentOrdonnance}
            optiqueOrdonnance={optiqueOrdonnance}
            downloadOrdonnance={downloadOrdonnance}
            setMedicamentDialogOpen={setMedicamentDialogOpen}
            setOptiqueDialogOpen={setOptiqueDialogOpen}
          />

          <OrdonnanceFormDialog
            examId={numericExamId}
            examType="child"
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
            examType="child"
            mode="optique"
            open={optiqueDialogOpen}
            onClose={() => setOptiqueDialogOpen(false)}
            initialData={
              (optiqueOrdonnance?.prescription_data as PrescriptionData) ?? null
            }
          />

          {/* Main Content */}
          <FormProvider {...form}>
            <main className="flex-1 overflow-y-auto p-6">
              {/* TECHNIQUE */}
              {activeSection === 'technical' && (
                <ChildExamTechnicalPanel
                  examId={examId}
                  technicalSubsection={technicalSubsection}
                  setTechnicalSubsection={setTechnicalSubsection}
                  handleSaveTechnical={handleSaveTechnical}
                  isSaving={isSaving}
                />
              )}

              {/* CLINIQUE */}
              {activeSection === 'clinical' && (
                <ChildExamClinicalPanel
                  examId={examId}
                  clinicalSubsection={clinicalSubsection}
                  setClinicalSubsection={setClinicalSubsection}
                  handleSaveClinical={handleSaveClinical}
                  isSaving={isSaving}
                  simplifiedClinicalExam={simplifiedClinicalExam}
                  onToggleSimplifiedClinicalExam={
                    onToggleSimplifiedClinicalExam
                  }
                />
              )}

              {/* COMPLÉMENTAIRES */}
              {activeSection === 'complementary' && (
                <ChildExamComplementaryPanel
                  examId={examId}
                  complementarySubsection={complementarySubsection}
                  setComplementarySubsection={setComplementarySubsection}
                  handleSaveComplementary={handleSaveComplementary}
                  isSaving={isSaving}
                  clinicalExamId={clinicalExamId}
                  attachments={attachments}
                  isLoadingAttachments={isLoadingAttachments}
                  selectedFiles={selectedFiles}
                  fileDescription={fileDescription}
                  setFileDescription={setFileDescription}
                  handleFileSelect={handleFileSelect}
                  handleUploadFiles={handleUploadFiles}
                  handleDeleteAttachment={handleDeleteAttachment}
                  handleDownloadAttachment={handleDownloadAttachment}
                  isUploading={isUploading}
                  isDeleting={isDeleting}
                  downloadingId={downloadingId}
                />
              )}

              {/* CONCLUSION */}
              {activeSection === 'conclusion' && (
                <ChildExamConclusionPanel
                  examId={examId}
                  isSaving={isSaving}
                  onRequestSave={() => setShowSaveDialog(true)}
                />
              )}
            </main>
          </FormProvider>
        </div>
      </SidebarInset>

      <ChildExamDialogs
        showSaveDialog={showSaveDialog}
        setShowSaveDialog={setShowSaveDialog}
        handleSaveConclusion={handleSaveConclusion}
        showFinalizeDialog={showFinalizeDialog}
        setShowFinalizeDialog={setShowFinalizeDialog}
        handleFinalizeExam={handleFinalizeExam}
        isCompleting={isCompleting}
      />
    </>
  );
}
