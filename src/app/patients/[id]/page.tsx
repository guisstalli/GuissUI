'use client';

import { format } from 'date-fns';
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
import { useParams, useRouter } from 'next/navigation';

import { Shell } from '@/components/layouts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCreateAdultExam, useCreateChildExam } from '@/features/exams/api';
import { usePatient, usePatientExams } from '@/features/patients/api';
import { MedicalHistoryForm } from '@/features/patients/components/medical-history-form';
import { SEX_LABELS } from '@/features/patients/types/schemas';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();

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

  // Mutations pour créer un examen - sélection automatique basée sur patient.is_adult
  const createAdultExamMutation = useCreateAdultExam({
    mutationConfig: {
      onSuccess: (data) => {
        router.push(`/exams/adult/${data.id}`);
      },
    },
  });

  const createChildExamMutation = useCreateChildExam({
    mutationConfig: {
      onSuccess: (data) => {
        router.push(`/exams/child/${data.id}`);
      },
    },
  });

  const isCreatingExam =
    createAdultExamMutation.isPending || createChildExamMutation.isPending;

  // Sélection automatique du type d'examen basée sur patient.is_adult
  const handleCreateExam = () => {
    if (!patient) return;

    if (patient.is_adult) {
      createAdultExamMutation.mutate({ patient_id: patientId });
    } else {
      createChildExamMutation.mutate({ patient_id: patientId });
    }
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
              <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
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
              onClick={handleCreateExam}
              disabled={isCreatingExam}
              size="sm"
            >
              {isCreatingExam ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Plus className="mr-1.5 size-4" aria-hidden="true" />
                  Nouvel examen
                </>
              )}
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
            Informations
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
                Informations personnelles
              </h3>
              <div className="rounded-lg border border-border bg-card p-4">
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">
                      Numéro identifiant
                    </dt>
                    <dd className="font-mono text-sm font-medium text-foreground">
                      {patient.numero_identifiant}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Nom</dt>
                    <dd className="text-sm font-medium text-foreground">
                      {patient.last_name}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Prénom</dt>
                    <dd className="text-sm font-medium text-foreground">
                      {patient.name}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">
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
                    <dt className="text-sm text-muted-foreground">Âge</dt>
                    <dd className="text-sm font-medium text-foreground">
                      {patient.age} ans
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Sexe</dt>
                    <dd className="text-sm font-medium text-foreground">
                      {SEX_LABELS[patient.sex]}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Type</dt>
                    <dd className="text-sm font-medium text-foreground">
                      {patient.is_adult ? 'Adulte' : 'Enfant'}
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
                    <dt className="text-sm text-muted-foreground">Téléphone</dt>
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

            {/* Statistiques examens */}
            {patient.examens_count && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">Examens</h3>
                <div className="rounded-lg border border-border bg-card p-4">
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">
                        Examens adulte
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
                        {patient.examens_count.adult || 0}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm text-muted-foreground">
                        Examens enfant
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
                        {patient.examens_count.child || 0}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            )}

            {/* Métadonnées */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-foreground">
                Métadonnées
              </h3>
              <div className="rounded-lg border border-border bg-card p-4">
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">Créé le</dt>
                    <dd className="text-sm font-medium text-foreground">
                      {format(new Date(patient.created), 'dd/MM/yyyy à HH:mm', {
                        locale: fr,
                      })}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-muted-foreground">
                      Dernière modification
                    </dt>
                    <dd className="text-sm font-medium text-foreground">
                      {format(
                        new Date(patient.modified),
                        'dd/MM/yyyy à HH:mm',
                        { locale: fr },
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
          <MedicalHistoryForm patientId={patientId} />
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
                  <h3 className="text-sm font-medium text-foreground">
                    Examens Adulte ({patientExams.adult.length})
                  </h3>
                  <div className="overflow-hidden rounded-lg border border-border">
                    <table className="w-full">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                            N° Examen
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                            Statut
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
                              {exam.numero_examen}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {format(new Date(exam.created), 'dd/MM/yyyy', {
                                locale: fr,
                              })}
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
                  <h3 className="text-sm font-medium text-foreground">
                    Examens Enfant ({patientExams.child.length})
                  </h3>
                  <div className="overflow-hidden rounded-lg border border-border">
                    <table className="w-full">
                      <thead className="bg-muted/50 border-b border-border">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                            N° Examen
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                            Reflet Pupillaire
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                            Fond d&apos;œil
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
                              {exam.numero_examen}
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">
                              {format(new Date(exam.created), 'dd/MM/yyyy', {
                                locale: fr,
                              })}
                            </td>
                            <td className="px-4 py-3 text-sm capitalize">
                              {exam.reflet_pupillaire || '-'}
                            </td>
                            <td className="px-4 py-3 text-sm capitalize">
                              {exam.fo || '-'}
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
                    <p className="text-sm text-muted-foreground">
                      Aucun examen réalisé pour ce patient
                    </p>
                    <Button
                      className="mt-4"
                      size="sm"
                      onClick={handleCreateExam}
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
    </Shell>
  );
}
