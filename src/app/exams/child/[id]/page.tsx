'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Loader2,
  User,
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
import { useChildExam, useUpdateTechnicalData } from '@/features/exams/api';
import { ExamStepper } from '@/features/exams/components/exam-stepper';
import {
  ClinicalCheckChildForm,
  OcularTensionForm,
  RefractionForm,
  VisionBinoculaireForm,
  VisualAcuityForm,
} from '@/features/exams/components/forms';
import {
  ClinicalCheckChildSchema,
  OcularTensionSchema,
  RefractionSchema,
  VisionBinoculaireSchema,
  VisualAcuitySchema,
} from '@/features/exams/types';
import {
  mapClinicalCheckChildApiToForm,
  mapOcularTensionApiToForm,
  mapRefractionApiToForm,
  mapVisionBinoculaireApiToForm,
  mapVisualAcuityApiToForm,
} from '@/features/exams/utils';
import { cn } from '@/lib/utils';

/**
 * Child Exam Page
 *
 * WORKFLOW per specs:
 * - Mandatory stepper
 * - Linear navigation
 * - Single atomic submit at the end
 * - No partial save
 *
 * STEPS:
 * 1. General & Antecedents - Patient identity (read-only) + Medical History
 * 2. Technical Exam - Visual Acuity, Refraction, Ocular Tension
 * 3. Binocular Vision (Child-specific) - Hirschberg, Stereoscopy, Pupillary Reflex, Cover Test
 * 4. Clinical Check (Simplified) - Reflet Pupillaire, Fond d'œil
 * 5. Review & Submit - Read-only summary, Final confirmation
 */

const steps = [
  { id: 'general', title: 'Général' },
  { id: 'technical', title: 'Examen Technique' },
  { id: 'binocular', title: 'Vision Binoculaire' },
  { id: 'clinical', title: 'Examen Clinique' },
  { id: 'review', title: 'Validation' },
];

// Combined schema for child exam
const childExamSchema = z.object({
  // Step 2: Technical
  visualAcuity: VisualAcuitySchema,
  refraction: RefractionSchema,
  ocularTension: OcularTensionSchema,
  // Step 3: Binocular Vision
  visionBinoculaire: VisionBinoculaireSchema,
  // Step 4: Clinical Check
  clinicalCheck: ClinicalCheckChildSchema,
});

type ChildExamFormValues = z.infer<typeof childExamSchema>;

// Helper to transform API patient data to display format
const transformPatient = (patient: {
  id: number;
  numero_identifiant: string;
  name: string;
  last_name: string;
  full_name: string;
  date_de_naissance: string;
  age: number;
  sex: string;
  is_adult: boolean;
}) => ({
  id: patient.id.toString(),
  firstName: patient.name,
  lastName: patient.last_name,
  age: patient.age,
  sex:
    patient.sex === 'H'
      ? 'Masculin'
      : patient.sex === 'F'
        ? 'Féminin'
        : 'Autre',
  dateOfBirth: patient.date_de_naissance,
  medicalRecordNumber: patient.numero_identifiant,
});

export default function ChildExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = params.id as string;
  const isNewExam = examId === 'new';
  const numericExamId = isNewExam ? 0 : Number(examId);

  const [currentStep, setCurrentStep] = useState(0);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch exam data from API
  const {
    data: examData,
    isLoading: isLoadingExam,
    isError: isErrorExam,
    refetch: refetchExam,
  } = useChildExam({
    id: numericExamId,
    enabled: !isNewExam && numericExamId > 0,
  });

  // Mutations pour mettre à jour les données
  const { mutate: updateTechnical, isPending: isUpdatingTechnical } =
    useUpdateTechnicalData({});

  // Transform patient data from exam
  const patient = examData?.patient
    ? transformPatient(examData.patient)
    : {
        id: '',
        firstName: '',
        lastName: '',
        age: 0,
        sex: '',
        dateOfBirth: '',
        medicalRecordNumber: '',
      };

  const form = useForm<ChildExamFormValues>({
    resolver: zodResolver(childExamSchema),
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
      ocularTension: {
        od: null,
        og: null,
      },
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
    },
    mode: 'onBlur',
  });

  // Load existing exam data into form
  useEffect(() => {
    if (examData) {
      // Map exam data to form values using mappers
      const visualAcuity = mapVisualAcuityApiToForm(examData.visual_acuity);
      const refraction = mapRefractionApiToForm(examData.refraction);
      const ocularTension = mapOcularTensionApiToForm(examData.ocular_tension);
      const visionBinoculaire = mapVisionBinoculaireApiToForm(
        examData.vision_binoculaire,
      );
      const clinicalCheck = mapClinicalCheckChildApiToForm({
        reflet_pupillaire: examData.reflet_pupillaire,
        reflet_pupillaire_detail: examData.reflet_pupillaire_detail,
        fo: examData.fo,
        fo_detail: examData.fo_detail,
      });

      form.reset({
        visualAcuity: visualAcuity ?? form.getValues().visualAcuity,
        refraction: refraction ?? form.getValues().refraction,
        ocularTension: ocularTension ?? form.getValues().ocularTension,
        visionBinoculaire:
          visionBinoculaire ?? form.getValues().visionBinoculaire,
        clinicalCheck: clinicalCheck ?? form.getValues().clinicalCheck,
      });
    }
  }, [examData, form]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Fonction pour mapper les données du formulaire vers le format API
  // Pour l'examen enfant, les champs cliniques (reflet_pupillaire, fo, etc.)
  // sont au niveau racine, pas dans un objet séparé
  const mapFormToApi = useCallback((data: ChildExamFormValues) => {
    // Construire l'objet vision_binoculaire conditionnellement
    // Règles du backend:
    // - Si reflet_pupillaire est null/undefined: ne pas envoyer le champ ou envoyer null
    // - Si reflet_pupillaire est "rouge": OK sans detail ni lateralite
    // - Si reflet_pupillaire est autre ("leucocorie", "anormal"): DOIT inclure reflet_pupillaire_detail et reflet_lateralite
    const pupillaryReflex = data.visionBinoculaire.pupillary_reflex;
    const needsDetailAndLaterality =
      pupillaryReflex && pupillaryReflex !== 'rouge';

    // Construire l'objet vision_binoculaire de base
    const visionBinoculaireData: Record<string, unknown> = {
      hirschberg_type: data.visionBinoculaire.hirschberg_type,
      hirschberg_detail: data.visionBinoculaire.hirschberg_detail,
      stereoscopie_lang_ii: data.visionBinoculaire.stereoscopy_lang,
      cover_vl_type: data.visionBinoculaire.cover_test_vl_type,
      cover_vl_direction: data.visionBinoculaire.cover_test_vl_direction,
      cover_vp_type: data.visionBinoculaire.cover_test_vp_type,
      cover_vp_direction: data.visionBinoculaire.cover_test_vp_direction,
    };

    // Ajouter reflet_pupillaire seulement s'il a une valeur
    if (pupillaryReflex) {
      visionBinoculaireData.reflet_pupillaire = pupillaryReflex;

      // Si pas "rouge", on doit inclure detail et lateralite
      if (needsDetailAndLaterality) {
        visionBinoculaireData.reflet_pupillaire_detail = null;
        visionBinoculaireData.reflet_lateralite =
          data.visionBinoculaire.pupillary_reflex_laterality;
      }
    }

    return {
      // Données techniques
      visual_acuity: {
        avsc_od: data.visualAcuity.avsc_od,
        avsc_og: data.visualAcuity.avsc_og,
        avsc_odg: data.visualAcuity.avsc_odg,
        avac_od: data.visualAcuity.avac_od,
        avac_og: data.visualAcuity.avac_og,
        avac_odg: data.visualAcuity.avac_odg,
      },
      refraction: {
        od_s: data.refraction.od_sphere,
        od_c: data.refraction.od_cylinder,
        od_a: data.refraction.od_axis,
        og_s: data.refraction.og_sphere,
        og_c: data.refraction.og_cylinder,
        og_a: data.refraction.og_axis,
        avod: data.refraction.od_visual_acuity,
        avog: data.refraction.og_visual_acuity,
        retinoscopie_focale_h: data.refraction.retino_od_sphere,
        retinoscopie_focale_v: data.refraction.retino_od_cylinder,
        retinoscopie_axe_h: data.refraction.retino_od_axis,
        retinoscopie_avec_focale_h: data.refraction.retino_og_sphere,
        retinoscopie_avec_focale_v: data.refraction.retino_og_cylinder,
        retinoscopie_avec_axe_h: data.refraction.retino_og_axis,
        dp: data.refraction.dp,
      },
      ocular_tension: {
        od: data.ocularTension.od,
        og: data.ocularTension.og,
      },
      // Vision binoculaire avec champs conditionnels
      vision_binoculaire: visionBinoculaireData,
      // Champs cliniques au niveau racine de l'examen enfant
      reflet_pupillaire: data.clinicalCheck.reflet_pupillaire,
      reflet_pupillaire_detail: data.clinicalCheck.reflet_pupillaire_detail,
      fo: data.clinicalCheck.fond_oeil,
      fo_detail: data.clinicalCheck.fo_detail,
    };
  }, []);

  const handleSubmitExam = useCallback(
    (data: ChildExamFormValues) => {
      if (isNewExam || numericExamId <= 0) {
        console.error('Cannot submit: exam ID is invalid');
        return;
      }

      setIsSubmitting(true);

      // Mapper toutes les données vers le format API
      const apiData = mapFormToApi(data);

      // Soumettre toutes les données via l'endpoint technical
      // (qui accepte aussi les champs cliniques au niveau racine pour l'examen enfant)
      updateTechnical(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        { id: numericExamId, data: apiData as any },
        {
          onSuccess: () => {
            setIsSubmitting(false);
            setShowSubmitDialog(false);
            refetchExam();
            // Rediriger vers la page patient
            if (examData?.patient?.id) {
              router.push(`/patients/${examData.patient.id}`);
            } else {
              router.push('/exams/child');
            }
          },
          onError: () => {
            setIsSubmitting(false);
          },
        },
      );
    },
    [
      isNewExam,
      numericExamId,
      mapFormToApi,
      updateTechnical,
      refetchExam,
      examData?.patient?.id,
      router,
    ],
  );

  const onSubmit = () => {
    setShowSubmitDialog(true);
  };

  // Loading state
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

  // Error state
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

  return (
    <SidebarProvider>
      <ChildExamContent
        patient={patient}
        currentStep={currentStep}
        showSubmitDialog={showSubmitDialog}
        setShowSubmitDialog={setShowSubmitDialog}
        form={form}
        handleNext={handleNext}
        handlePrevious={handlePrevious}
        handleSubmitExam={handleSubmitExam}
        onSubmit={onSubmit}
        isNewExam={isNewExam}
        examId={examId}
        isSubmitting={isSubmitting || isUpdatingTechnical}
      />
    </SidebarProvider>
  );
}

// Internal component that uses useSidebar
function ChildExamContent({
  patient,
  currentStep,
  showSubmitDialog,
  setShowSubmitDialog,
  form,
  handleNext,
  handlePrevious,
  handleSubmitExam,
  onSubmit,
  isNewExam,
  examId,
  isSubmitting,
}: {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    age: number;
    sex: string;
    dateOfBirth: string;
    medicalRecordNumber: string;
  };
  currentStep: number;
  showSubmitDialog: boolean;
  setShowSubmitDialog: (show: boolean) => void;
  form: ReturnType<typeof useForm<ChildExamFormValues>>;
  handleNext: () => void;
  handlePrevious: () => void;
  handleSubmitExam: (data: ChildExamFormValues) => void;
  onSubmit: () => void;
  isNewExam: boolean;
  examId: string;
  isSubmitting: boolean;
}) {
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
          title="Examen Enfant"
          patientName={`${patient.lastName}, ${patient.firstName}`}
        />

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
                  Examen Pédiatrique
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isNewExam ? 'Nouvel examen' : `Examen ID: ${examId}`}
                </p>
              </div>
              <Badge variant="secondary">Enfant ({patient.age} ans)</Badge>
            </div>
          </div>

          {/* Stepper */}
          <div className="mb-8 rounded-lg border border-border bg-card p-4">
            <ExamStepper steps={steps} currentStep={currentStep} />
          </div>

          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(handleSubmitExam)}>
              {/* Step Content */}
              <div className="rounded-lg border border-border bg-card">
                {/* Step 0: General & Antecedents */}
                {currentStep === 0 && (
                  <div className="p-6">
                    <h2 className="mb-4 text-lg font-medium text-foreground">
                      Informations Générales
                    </h2>
                    <p className="mb-6 text-sm text-muted-foreground">
                      Vérifiez les informations du patient avant de commencer
                      l&apos;examen.
                    </p>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <User className="size-4" aria-hidden="true" />
                          Identité du Patient
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <dl className="grid grid-cols-2 gap-4 md:grid-cols-3">
                          <div>
                            <dt className="text-xs text-muted-foreground">
                              Nom complet
                            </dt>
                            <dd className="text-sm font-medium text-foreground">
                              {patient.lastName}, {patient.firstName}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted-foreground">
                              ID Patient
                            </dt>
                            <dd className="font-mono text-sm text-foreground">
                              {patient.id}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted-foreground">
                              Date de naissance
                            </dt>
                            <dd className="text-sm text-foreground">
                              {patient.dateOfBirth}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted-foreground">
                              Âge
                            </dt>
                            <dd className="text-sm text-foreground">
                              {patient.age} ans
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted-foreground">
                              Sexe
                            </dt>
                            <dd className="text-sm text-foreground">
                              {patient.sex}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-xs text-muted-foreground">
                              N° Dossier
                            </dt>
                            <dd className="font-mono text-sm text-foreground">
                              {patient.medicalRecordNumber}
                            </dd>
                          </div>
                        </dl>
                      </CardContent>
                    </Card>

                    <div className="border-primary/30 bg-primary/10 mt-6 flex items-center gap-2 rounded-md border p-3">
                      <AlertCircle
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      <p className="text-sm text-foreground">
                        Veuillez vérifier que les informations correspondent au
                        patient présent.
                      </p>
                    </div>
                  </div>
                )}

                {/* Step 1: Technical Exam */}
                {currentStep === 1 && (
                  <div className="space-y-8 p-6">
                    <div>
                      <h2 className="mb-2 text-lg font-medium text-foreground">
                        Examen Technique
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Acuité visuelle, réfraction et tension oculaire.
                      </p>
                    </div>

                    <VisualAcuityForm namePrefix="visualAcuity" />
                    <RefractionForm namePrefix="refraction" />
                    <OcularTensionForm namePrefix="ocularTension" />
                  </div>
                )}

                {/* Step 2: Binocular Vision (Child-specific) */}
                {currentStep === 2 && (
                  <div className="p-6">
                    <div className="mb-6">
                      <h2 className="mb-2 text-lg font-medium text-foreground">
                        Vision Binoculaire
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Évaluation spécifique de la vision binoculaire pour les
                        enfants.
                      </p>
                    </div>

                    <VisionBinoculaireForm namePrefix="visionBinoculaire" />
                  </div>
                )}

                {/* Step 3: Clinical Check (Simplified) */}
                {currentStep === 3 && (
                  <div className="p-6">
                    <div className="mb-6">
                      <h2 className="mb-2 text-lg font-medium text-foreground">
                        Examen Clinique Simplifié
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Contrôle du reflet pupillaire et du fond d&apos;œil.
                      </p>
                    </div>

                    <ClinicalCheckChildForm namePrefix="clinicalCheck" />
                  </div>
                )}

                {/* Step 4: Review & Submit */}
                {currentStep === 4 && (
                  <div className="p-6">
                    <h2 className="mb-4 text-lg font-medium text-foreground">
                      Validation de l&apos;examen
                    </h2>
                    <p className="mb-6 text-sm text-muted-foreground">
                      Vérifiez les données avant la soumission finale.
                    </p>

                    {/* Summary Cards */}
                    <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-sm">
                            <Check
                              className="size-4 text-primary"
                              aria-hidden="true"
                            />
                            Patient
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            {patient.lastName}, {patient.firstName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {patient.age} ans
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-sm">
                            <Check
                              className="size-4 text-primary"
                              aria-hidden="true"
                            />
                            Examen Technique
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Complété
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-sm">
                            <Check
                              className="size-4 text-primary"
                              aria-hidden="true"
                            />
                            Vision Binoculaire
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Complété
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-sm">
                            <Check
                              className="size-4 text-primary"
                              aria-hidden="true"
                            />
                            Examen Clinique
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground">
                            Complété
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="border-primary/30 bg-primary/10 flex items-center gap-2 rounded-md border p-3">
                      <AlertCircle
                        className="size-4 text-primary"
                        aria-hidden="true"
                      />
                      <p className="text-sm text-foreground">
                        Une fois soumis, l&apos;examen ne pourra plus être
                        modifié.
                      </p>
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className="flex items-center justify-between border-t border-border p-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentStep === 0 || isSubmitting}
                  >
                    <ArrowLeft className="mr-1.5 size-4" aria-hidden="true" />
                    Précédent
                  </Button>

                  {currentStep < steps.length - 1 ? (
                    <Button
                      type="button"
                      onClick={handleNext}
                      disabled={isSubmitting}
                    >
                      Suivant
                      <ArrowRight
                        className="ml-1.5 size-4"
                        aria-hidden="true"
                      />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      onClick={onSubmit}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2
                            className="mr-1.5 size-4 animate-spin"
                            aria-hidden="true"
                          />
                          Soumission en cours...
                        </>
                      ) : (
                        "Soumettre l'examen"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </FormProvider>
        </main>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Soumettre l&apos;examen</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir soumettre cet examen ? Une fois soumis,
              les données ne pourront plus être modifiées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => form.handleSubmit(handleSubmitExam)()}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2
                    className="mr-1.5 size-4 animate-spin"
                    aria-hidden="true"
                  />
                  Soumission en cours...
                </>
              ) : (
                'Confirmer'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
