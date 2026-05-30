'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  Check,
  Circle,
  ClipboardList,
  Download,
  Eye,
  FileText,
  Loader2,
  Paperclip,
  RotateCcw,
  Stethoscope,
  Trash2,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import * as z from 'zod';

import { AppSidebar, Header } from '@/components/layouts';
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
import { Input, Label } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress/progress';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { Switch } from '@/components/ui/switch';
import {
  useAttachments,
  useUploadAttachment,
  useDeleteAttachment,
  downloadAttachment,
} from '@/features/exams/api';
import {
  useChildExam,
  useUpdateTechnicalData,
  useUpdateClinicalData,
  useCompleteChildExam,
  useUncompleteChildExam,
} from '@/features/exams/api/child';
import {
  useDownloadChildReport,
  useDownloadChildConclusion,
} from '@/features/exams/api/child/download-report';
import {
  findOrdonnance,
  useDownloadOrdonnance,
  useExamOrdonnances,
} from '@/features/exams/api/ordonnances';
import {
  BiomicroscopyAnteriorForm,
  BiomicroscopyPosteriorForm,
  ClinicalCheckChildForm,
  ConclusionForm,
  ExamensAdditionelsSection,
  OcularTensionForm,
  PerimetryForm,
  PlaintesForm,
  RefractionForm,
  VisionBinoculaireForm,
  VisualAcuityForm,
} from '@/features/exams/components/forms';
import { OrdonnanceFormDialog } from '@/features/exams/components/ordonnance-form-dialog';
import {
  BiomicroscopyAnteriorSchema,
  BiomicroscopyPosteriorSchema,
  ClinicalCheckChildSchema,
  ConclusionSchema,
  defaultBiomicroscopyAnterior,
  defaultBiomicroscopyPosterior,
  OcularTensionSchema,
  PerimetrySchema,
  PlaintesSchema,
  RefractionSchema,
  VisionBinoculaireSchema,
  VisualAcuitySchema,
} from '@/features/exams/types';
import {
  mapBiomicroscopyAnteriorApiToForm,
  mapBiomicroscopyAnteriorFormToApi,
  mapBiomicroscopyPosteriorApiToForm,
  mapBiomicroscopyPosteriorFormToApi,
  mapClinicalCheckChildApiToForm,
  mapConclusionApiToForm,
  mapConclusionFormToApi,
  mapOcularTensionApiToForm,
  mapOcularTensionFormToApi,
  mapPerimetryApiToForm,
  mapPerimetryFormToApi,
  mapPlaintesApiToForm,
  mapPlaintesFormToApi,
  mapRefractionApiToForm,
  mapRefractionFormToApi,
  mapVisualAcuityApiToForm,
  mapVisualAcuityFormToApi,
  mapVisionBinoculaireApiToForm,
} from '@/features/exams/utils';
import { useUser } from '@/lib/auth';
import { cn } from '@/lib/utils';

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

const childExamSchema = z.object({
  visualAcuity: VisualAcuitySchema,
  refraction: RefractionSchema,
  ocularTension: OcularTensionSchema,
  visionBinoculaire: VisionBinoculaireSchema,
  clinicalCheck: ClinicalCheckChildSchema,
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
  conclusion: ConclusionSchema,
});

type ChildExamFormValues = z.infer<typeof childExamSchema>;

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
      const hasConclusion = !!examData.clinical_examen?.conclusion;

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
      /* noop */
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
  attachments: Array<{
    id: number;
    original_filename: string;
    file_url?: string | null;
    file_size: number;
    description?: string | null;
    is_image: boolean;
    is_pdf: boolean;
    created: string;
  }>;
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
          <aside className="w-64 shrink-0 border-r border-border bg-card p-4">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-foreground">
                  Sections
                </h2>
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
                        <span className="flex-1 text-left">
                          {section.title}
                        </span>
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
                <Link
                  href={patient.id ? `/patients/${patient.id}` : '/patients'}
                >
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
                  Rapports PDF
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
                  Rapport complet
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

          <OrdonnanceFormDialog
            examId={numericExamId}
            examType="child"
            mode="medicamenteuse"
            open={medicamentDialogOpen}
            onClose={() => setMedicamentDialogOpen(false)}
            initialData={
              (medicamentOrdonnance?.prescription_data as Parameters<
                typeof OrdonnanceFormDialog
              >[0]['initialData']) ?? null
            }
          />
          <OrdonnanceFormDialog
            examId={numericExamId}
            examType="child"
            mode="optique"
            open={optiqueDialogOpen}
            onClose={() => setOptiqueDialogOpen(false)}
            initialData={
              (optiqueOrdonnance?.prescription_data as Parameters<
                typeof OrdonnanceFormDialog
              >[0]['initialData']) ?? null
            }
          />

          {/* Main Content */}
          <FormProvider {...form}>
            <main className="flex-1 overflow-y-auto p-6">
              {/* TECHNIQUE */}
              {activeSection === 'technical' && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <div>
                    <h1 className="text-xl font-semibold">Examen Technique</h1>
                    <p className="text-sm text-muted-foreground">
                      Acuité visuelle, réfraction et tension oculaire
                    </p>
                  </div>
                  <div className="my-2 flex w-fit gap-1 rounded-lg border bg-card p-1">
                    {(
                      [
                        ['acuity', 'Acuité Visuelle'],
                        ['refraction', 'Réfraction'],
                        ['tension', 'Tension'],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        className={cn(
                          'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                          technicalSubsection === id
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                        onClick={() =>
                          setTechnicalSubsection(id as TechnicalSubsection)
                        }
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {technicalSubsection === 'acuity' && (
                    <VisualAcuityForm namePrefix="visualAcuity" />
                  )}
                  {technicalSubsection === 'refraction' && (
                    <RefractionForm namePrefix="refraction" />
                  )}
                  {technicalSubsection === 'tension' && (
                    <OcularTensionForm namePrefix="ocularTension" />
                  )}
                  <div className="mt-6 flex justify-end border-t border-border pt-4">
                    <Button
                      type="button"
                      onClick={handleSaveTechnical}
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
                </div>
              )}

              {/* CLINIQUE */}
              {activeSection === 'clinical' && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h1 className="text-xl font-semibold">Examen Clinique</h1>
                      <p className="text-sm text-muted-foreground">
                        Vision binoculaire et examen clinique simplifié
                      </p>
                    </div>
                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                    <label
                      htmlFor="toggle-clinical-exam"
                      className="bg-muted/30 flex cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-2"
                    >
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          Examen clinique complet
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Active biomicroscopie, périmétrie et conclusion
                        </p>
                      </div>
                      <Switch
                        id="toggle-clinical-exam"
                        checked={simplifiedClinicalExam}
                        onCheckedChange={onToggleSimplifiedClinicalExam}
                        disabled={isSaving || examId === 'new'}
                      />
                    </label>
                  </div>
                  <div className="my-2 flex w-fit gap-1 rounded-lg border bg-card p-1">
                    {(
                      [
                        ['visionBinoculaire', 'Vision Binoculaire'],
                        ['clinicalCheck', 'Examen Clinique'],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        className={cn(
                          'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                          clinicalSubsection === id
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground',
                        )}
                        onClick={() =>
                          setClinicalSubsection(id as ClinicalSubsection)
                        }
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {clinicalSubsection === 'visionBinoculaire' && (
                    <VisionBinoculaireForm namePrefix="visionBinoculaire" />
                  )}
                  {clinicalSubsection === 'clinicalCheck' && (
                    <ClinicalCheckChildForm namePrefix="clinicalCheck" />
                  )}
                  <div className="mt-6 flex justify-end border-t border-border pt-4">
                    <Button
                      type="button"
                      onClick={handleSaveClinical}
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
                </div>
              )}

              {/* COMPLÉMENTAIRES */}
              {activeSection === 'complementary' && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <div>
                    <h1 className="text-xl font-semibold">
                      Examens Complémentaires
                    </h1>
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
                          setComplementarySubsection(
                            id as ComplementarySubsection,
                          )
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
                          <CardTitle className="text-base">
                            Biomicroscopie — OD
                          </CardTitle>
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
                          <CardTitle className="text-base">
                            Biomicroscopie — OG
                          </CardTitle>
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
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Paperclip className="size-4" />
                          Pièces jointes
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {!clinicalExamId ? (
                          <p className="text-sm text-muted-foreground">
                            Enregistrez d&apos;abord les données complémentaires
                            pour pouvoir joindre des fichiers.
                          </p>
                        ) : (
                          <>
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="file-upload-child">
                                  Titre du document *
                                </Label>
                                <Input
                                  id="file-description-child"
                                  placeholder="Titre du document (obligatoire)"
                                  value={fileDescription}
                                  onChange={(e) =>
                                    setFileDescription(e.target.value)
                                  }
                                  className="mb-2"
                                />
                                <input
                                  id="file-upload-child"
                                  type="file"
                                  multiple
                                  title="Sélectionner des fichiers"
                                  className="hidden"
                                  onChange={handleFileSelect}
                                />
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    type="button"
                                    onClick={() =>
                                      document
                                        .getElementById('file-upload-child')
                                        ?.click()
                                    }
                                  >
                                    <Upload className="mr-1.5 size-3.5" />{' '}
                                    Sélectionner
                                  </Button>
                                  {selectedFiles.length > 0 && (
                                    <Button
                                      size="sm"
                                      type="button"
                                      onClick={handleUploadFiles}
                                      disabled={
                                        isUploading || !fileDescription.trim()
                                      }
                                    >
                                      {isUploading && (
                                        <Loader2 className="mr-2 size-3.5 animate-spin" />
                                      )}
                                      Envoyer ({selectedFiles.length})
                                    </Button>
                                  )}
                                </div>
                                {selectedFiles.length > 0 && (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {selectedFiles
                                      .map((f) => f.name)
                                      .join(', ')}
                                  </p>
                                )}
                              </div>
                            </div>
                            {isLoadingAttachments ? (
                              <div className="flex justify-center py-4">
                                <Loader2 className="size-5 animate-spin text-muted-foreground" />
                              </div>
                            ) : attachments.length === 0 ? (
                              <p className="text-center text-sm text-muted-foreground">
                                Aucune pièce jointe
                              </p>
                            ) : (
                              <ul className="space-y-2">
                                {attachments.map((att) => (
                                  <li
                                    key={att.id}
                                    className="flex items-center justify-between rounded-lg border px-3 py-2"
                                  >
                                    <div>
                                      <p className="text-sm font-medium">
                                        {att.description ??
                                          att.original_filename}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        {att.original_filename} ·{' '}
                                        {(att.file_size / 1024).toFixed(1)} Ko
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        type="button"
                                        onClick={() =>
                                          handleDownloadAttachment(
                                            att.id,
                                            att.original_filename,
                                          )
                                        }
                                        disabled={downloadingId === att.id}
                                      >
                                        {downloadingId === att.id ? (
                                          <Loader2 className="size-3.5 animate-spin" />
                                        ) : (
                                          '↓'
                                        )}
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        type="button"
                                        onClick={() =>
                                          handleDeleteAttachment(att.id)
                                        }
                                        disabled={isDeleting}
                                      >
                                        <Trash2 className="size-3.5 text-destructive" />
                                      </Button>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* CONCLUSION */}
              {activeSection === 'conclusion' && (
                <div className="rounded-lg border border-border bg-card p-4">
                  <div>
                    <h1 className="text-xl font-semibold">Conclusion</h1>
                    <p className="text-sm text-muted-foreground">
                      Vision, CAT, traitement et diagnostic
                    </p>
                  </div>
                  <ConclusionForm namePrefix="conclusion" />
                  <div className="mt-6 flex justify-end border-t border-border pt-4">
                    <Button
                      type="button"
                      onClick={() => setShowSaveDialog(true)}
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
                </div>
              )}
            </main>
          </FormProvider>
        </div>
      </SidebarInset>

      {/* Conclusion save confirmation */}
      <AlertDialog
        open={showSaveDialog}
        onOpenChange={(open) => {
          if (!open) setShowSaveDialog(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Enregistrer la conclusion</AlertDialogTitle>
            <AlertDialogDescription>
              La conclusion sera enregistrée. Vous pourrez la modifier
              ultérieurement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveConclusion}>
              Enregistrer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Finalize exam confirmation */}
      <AlertDialog
        open={showFinalizeDialog}
        onOpenChange={(open) => {
          if (!open) setShowFinalizeDialog(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Finaliser l&apos;examen</AlertDialogTitle>
            <AlertDialogDescription>
              L&apos;examen sera marqué comme terminé. Cette action peut être
              nécessaire pour générer les rapports PDF. Vous pourrez toujours
              modifier les sections individuellement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFinalizeExam}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {isCompleting ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Finaliser
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
