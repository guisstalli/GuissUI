'use client';

// eslint-disable-next-line import/no-duplicates
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
// eslint-disable-next-line import/no-duplicates
import { fr } from 'date-fns/locale';
import {
  ArrowLeft,
  Baby,
  ClipboardList,
  ExternalLink,
  Loader2,
  Plus,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AppShell as Shell } from '@/app/_shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
//import { PatientAnalyticsContext } from '@/features/analytics/components';
import { useCreateAdultExam, useCreateChildExam } from '@/features/exams/api';
import {
  usePatient,
  usePatientExams,
  usePatchPatient,
} from '@/features/patients/api';
import { MedicalHistoryForm } from '@/features/patients/components/medical-history-form';
import { SEX_LABELS } from '@/features/patients/types/schemas';
import { SiteSelector } from '@/features/sites/components/site-selector';

const editPatientSchema = z.object({
  last_name: z.string().min(1, 'Le nom est requis'),
  name: z.string().min(1, 'Le prénom est requis'),
  date_de_naissance: z.string().min(1, 'La date de naissance est requise'),
  sex: z.enum(['H', 'F', 'A']),
  phone_number: z.string().nullable().optional(),
});
type EditPatientValues = z.infer<typeof editPatientSchema>;

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const patientId = Number(params.id);

  const {
    data: patient,
    isLoading,
    error,
  } = usePatient({
    id: patientId,
    enabled: !!patientId,
  });

  // Récupérer les examens du patient
  const { data: patientExams, isLoading: isLoadingExams } = usePatientExams({
    patientId,
    enabled: !!patientId,
  });

  // Edit modal: open when ?edit=true is in URL
  const [isEditModalOpen, setIsEditModalOpen] = useState(
    searchParams.get('edit') === 'true',
  );
  const editForm = useForm<EditPatientValues>({
    resolver: zodResolver(editPatientSchema),
  });
  useEffect(() => {
    if (patient && isEditModalOpen) {
      editForm.reset({
        last_name: patient.last_name,
        name: patient.name,
        date_de_naissance: patient.date_de_naissance,
        sex: patient.sex as 'H' | 'F' | 'A',
        phone_number: patient.phone_number ?? '',
      });
    }
  }, [patient, isEditModalOpen, editForm]);
  const patchPatientMutation = usePatchPatient({
    mutationConfig: {
      onSuccess: () => {
        setIsEditModalOpen(false);
        router.replace(`/patients/${patientId}`);
      },
    },
  });
  const handleEditSubmit = (values: EditPatientValues) => {
    patchPatientMutation.mutate({ id: patientId, data: values });
  };

  // Modal State for Exam Creation + Site Selection
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);

  // Mutations pour créer un examen - sélection automatique basée sur patient.is_adult
  const createAdultExamMutation = useCreateAdultExam({
    mutationConfig: {
      onSuccess: (data) => {
        const examId = data.id;
        setIsExamModalOpen(false);
        requestAnimationFrame(() => router.push(`/exams/adult/${examId}`));
      },
    },
  });

  const createChildExamMutation = useCreateChildExam({
    mutationConfig: {
      onSuccess: (data) => {
        const examId = data.id;
        setIsExamModalOpen(false);
        requestAnimationFrame(() => router.push(`/exams/child/${examId}`));
      },
    },
  });

  const isCreatingExam =
    createAdultExamMutation.isPending || createChildExamMutation.isPending;

  // Sélection automatique du type d'examen avec inclusion du site
  const handleConfirmCreateExam = () => {
    if (!patient || !selectedSiteId) return;

    if (patient.is_adult) {
      createAdultExamMutation.mutate({
        patient_id: patientId,
        site_id: selectedSiteId,
      });
    } else {
      createChildExamMutation.mutate({
        patient_id: patientId,
        site_id: selectedSiteId,
      });
    }
  };

  const handleOpenExamModal = () => {
    setIsExamModalOpen(true);
    setSelectedSiteId(null);
  };

  if (isLoading) {
    return (
      <Shell title="Patient">
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      </Shell>
    );
  }

  if (error || !patient) {
    return (
      <Shell title="Patient">
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <p className="text-destructive">Patient non trouvé</p>
          <Button variant="outline" asChild>
            <Link href="/patients">Retour à la liste</Link>
          </Button>
        </div>
      </Shell>
    );
  }

  return (
    <Shell title="Patients">
      {/* Back Link */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/patients">
            <ArrowLeft className="mr-1.5 size-4" aria-hidden="true" />
            Retour aux patients
          </Link>
        </Button>
      </div>

      {/* Patient Header */}
      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
              {patient.is_adult ? (
                <User
                  className="size-6 text-muted-foreground"
                  aria-hidden="true"
                />
              ) : (
                <Baby
                  className="size-6 text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {patient.full_name}
              </h2>
              <div className="mt-1 flex items-center gap-3 text-sm font-medium text-muted-foreground">
                <span className="font-mono">{patient.numero_identifiant}</span>
                <span aria-hidden="true">·</span>
                <span>{patient.age} ans</span>
                <span aria-hidden="true">·</span>
                <span>{SEX_LABELS[patient.sex]}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {patient.is_adult ? 'Adulte' : 'Enfant'}
            </Badge>
            <Button
              onClick={handleOpenExamModal}
              disabled={isCreatingExam}
              size="sm"
            >
              <Plus className="mr-1.5 size-4" aria-hidden="true" />
              Nouvel examen
            </Button>
          </div>
        </div>
      </div>

      {/* Patient Tabs - 3 tabs now */}
      <Tabs defaultValue="information" className="w-full">
        <TabsList className="w-full justify-start border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="information"
            className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Etat civil & contact
          </TabsTrigger>
          <TabsTrigger
            value="medical-history"
            className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Antécédents médicaux
          </TabsTrigger>
          <TabsTrigger
            value="exams"
            className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Examens réalisés
          </TabsTrigger>
        </TabsList>

        {/* Information Tab */}
        <TabsContent value="information" className="mt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">
                Etat civil
              </h3>
              <div className="rounded-lg border border-border bg-card p-4">
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Nom
                    </dt>
                    <dd className="text-sm font-medium text-foreground">
                      {patient.last_name}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Prénom
                    </dt>
                    <dd className="text-sm font-medium text-foreground">
                      {patient.name}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Date de naissance
                    </dt>
                    <dd className="text-sm font-medium text-foreground">
                      {format(
                        new Date(patient.date_de_naissance),
                        'dd MMMM yyyy',
                        { locale: fr },
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Âge
                    </dt>
                    <dd className="text-sm font-medium text-foreground">
                      {patient.age} ans
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Sexe
                    </dt>
                    <dd className="text-sm font-medium text-foreground">
                      {SEX_LABELS[patient.sex]}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">Contact</h3>
              <div className="rounded-lg border border-border bg-card p-4">
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm font-medium text-muted-foreground">
                      Téléphone
                    </dt>
                    <dd className="text-sm font-medium text-foreground">
                      {patient.phone_number || (
                        <span className="text-muted-foreground">
                          Non renseigné
                        </span>
                      )}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Medical History Tab */}
        <TabsContent value="medical-history" className="mt-6">
          <MedicalHistoryForm
            patientId={patientId}
            hasDriver={patient.has_driver ?? false}
          />
        </TabsContent>

        {/* Exams Tab */}
        <TabsContent value="exams" className="mt-6">
          {isLoadingExams ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Examens Adulte */}
              {patientExams?.adult && patientExams.adult.length > 0 && (
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-lg border border-border">
                    <table className="w-full">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                            N° Examen
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                            Site
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                            Statut
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                            Date de création
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                            Dernière modification
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {patientExams.adult.map((exam) => (
                          <tr key={exam.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-mono text-sm">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/exams/adult/${exam.id}`}>
                                  <ExternalLink className="mr-1.5 size-4" />
                                  {exam.numero_examen}
                                </Link>
                              </Button>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-muted-foreground">
                              {exam.site_libelle || '—'}
                            </td>

                            <td className="px-4 py-3">
                              <Badge
                                variant={
                                  exam.is_completed ? 'default' : 'secondary'
                                }
                              >
                                {exam.is_completed ? 'Terminé' : 'En cours'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-muted-foreground">
                              {format(new Date(exam.created), 'dd/MM/yyyy', {
                                locale: fr,
                              })}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-muted-foreground">
                              {format(new Date(exam.modified), 'dd/MM/yyyy', {
                                locale: fr,
                              })}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/exams/adult/${exam.id}`}>
                                  <ExternalLink className="mr-1.5 size-4" />
                                  Voir
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Examens Enfant */}
              {patientExams?.child && patientExams.child.length > 0 && (
                <div className="space-y-3">
                  <div className="overflow-hidden rounded-lg border border-border">
                    <table className="w-full">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                            N° Examen
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                            Site
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                            Statut
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                            Date de création
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                            Dernière modification
                          </th>
                          <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {patientExams.child.map((exam) => (
                          <tr key={exam.id} className="hover:bg-muted/30">
                            <td className="px-4 py-3 font-mono text-sm">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/exams/child/${exam.id}`}>
                                  <ExternalLink className="mr-1.5 size-4" />
                                  {exam.numero_examen}
                                </Link>
                              </Button>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-muted-foreground">
                              {exam.site_libelle || '—'}
                            </td>
                            <td className="px-4 py-3">
                              <Badge
                                variant={
                                  exam.is_completed ? 'default' : 'secondary'
                                }
                              >
                                {exam.is_completed ? 'Terminé' : 'En cours'}
                              </Badge>
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-muted-foreground">
                              {format(new Date(exam.created), 'dd/MM/yyyy', {
                                locale: fr,
                              })}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-muted-foreground">
                              {format(new Date(exam.modified), 'dd/MM/yyyy', {
                                locale: fr,
                              })}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/exams/child/${exam.id}`}>
                                  <ExternalLink className="mr-1.5 size-4" />
                                  Voir
                                </Link>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {(!patientExams?.adult || patientExams.adult.length === 0) &&
                (!patientExams?.child || patientExams.child.length === 0) && (
                  <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
                    <ClipboardList className="mb-3 size-10 text-muted-foreground" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Aucun examen réalisé pour ce patient
                    </p>
                    <Button
                      className="mt-4"
                      size="sm"
                      onClick={handleOpenExamModal}
                      disabled={isCreatingExam}
                    >
                      <Plus className="mr-1.5 size-4" />
                      Créer un examen
                    </Button>
                  </div>
                )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Patient Dialog */}
      <Dialog
        open={isEditModalOpen}
        onOpenChange={(open) => {
          setIsEditModalOpen(open);
          if (!open) router.replace(`/patients/${patientId}`);
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le patient</DialogTitle>
            <DialogDescription>
              Modifiez les informations de {patient.full_name}.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(handleEditSubmit)}
              className="space-y-4 py-2"
            >
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="last_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prénom</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="date_de_naissance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date de naissance</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sexe</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Object.entries(SEX_LABELS).map(([value, label]) => (
                            <SelectItem key={value} value={value}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder="+221 XX XXX XX XX"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    router.replace(`/patients/${patientId}`);
                  }}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={patchPatientMutation.isPending}>
                  {patchPatientMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    'Enregistrer'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Exam Creation Dialog */}
      <Dialog
        open={isExamModalOpen}
        onOpenChange={(open) => !open && setIsExamModalOpen(false)}
      >
        <DialogContent
          className="sm:max-w-[425px]"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Créer un nouvel examen</DialogTitle>
            <DialogDescription>
              Veuillez sélectionner le site de dépistage avant de poursuivre
              vers l&apos;examen pour le patient {patient.full_name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <span className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Site de dépistage
              </span>
              <SiteSelector
                value={selectedSiteId}
                onChange={(id: number | null) => setSelectedSiteId(id)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsExamModalOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleConfirmCreateExam}
              disabled={
                !selectedSiteId ||
                createAdultExamMutation.isPending ||
                createChildExamMutation.isPending
              }
            >
              {createAdultExamMutation.isPending ||
              createChildExamMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Création...
                </>
              ) : (
                'Créer'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
