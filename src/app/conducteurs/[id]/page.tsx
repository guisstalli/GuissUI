'use client';

import dayjs from 'dayjs';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ClipboardList,
  Download,
  Edit,
  FileText,
  Loader2,
  Plus,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { AppShell as Shell } from '@/app/_shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import { Spinner } from '@/components/ui/spinner';
import {
  TableBody,
  TableCell,
  TableElement as Table,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs/tabs';
import { useDriver } from '@/features/drivers/api/get-driver';
import { useUpdateDriver } from '@/features/drivers/api/update-driver';
import { DriverForm } from '@/features/drivers/components/driver-form';
import type { DriverCreate } from '@/features/drivers/types/schemas';
import {
  useDownloadAdultConclusion,
  useDownloadAdultReport,
} from '@/features/exams/api/adult/download-report';
import { useCreateAdultExam } from '@/features/exams/api/adult/mutations';
import { usePatientExams } from '@/features/patients/api/get-patient-exams';
import { MedicalHistoryForm } from '@/features/patients/components/medical-history-form';

const TYPE_PERMIS_LABELS: Record<string, string> = {
  Leger: 'Léger',
  Lourd: 'Lourd',
  Autres: 'Autres',
};
const SERVICE_LABELS: Record<string, string> = {
  Public: 'Public',
  Prive: 'Privé',
  Particulier: 'Particulier',
};
const VEHICULE_LABELS: Record<string, string> = {
  Leger: 'Léger',
  Lourd: 'Lourd',
  Autres: 'Autres',
};
const NIVEAU_LABELS: Record<string, string> = {
  Primaire: 'Primaire',
  Secondaire: 'Secondaire',
  Superieure: 'Supérieure',
  Autres: 'Autres',
  Aucune: 'Aucune',
};
const SEX_LABELS: Record<string, string> = {
  H: 'Homme',
  F: 'Femme',
  A: 'Anonyme',
};

function ExamsTab({ patientId }: { patientId: number }) {
  const router = useRouter();
  const { data: exams, isLoading } = usePatientExams({ patientId });
  const downloadReport = useDownloadAdultReport();
  const downloadConclusion = useDownloadAdultConclusion();

  const createAdultMutation = useCreateAdultExam({
    mutationConfig: {
      onSuccess: (data) => router.push(`/exams/adult/${data.id}`),
    },
  });

  const adultExams = exams?.adult ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {adultExams.length} examen{adultExams.length !== 1 ? 's' : ''}
        </p>
        <Button
          size="sm"
          onClick={() => createAdultMutation.mutate({ patient_id: patientId })}
          disabled={createAdultMutation.isPending}
        >
          {createAdultMutation.isPending ? (
            <Loader2 className="mr-1.5 size-3.5 animate-spin" />
          ) : (
            <Plus className="mr-1.5 size-3.5" />
          )}
          Nouvel examen adulte
        </Button>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!isLoading && adultExams.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center">
          <ClipboardList className="mb-3 size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Aucun examen pour ce patient
          </p>
        </div>
      )}

      {!isLoading && adultExams.length > 0 && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>N° Examen</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Site</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adultExams.map((exam) => (
                <TableRow key={exam.id}>
                  <TableCell className="font-mono text-sm">
                    {exam.numero_examen}
                  </TableCell>
                  <TableCell className="text-sm">
                    {dayjs(exam.created).format('DD/MM/YYYY')}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {exam.site_libelle ?? '—'}
                  </TableCell>
                  <TableCell>
                    {exam.is_completed ? (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                      >
                        <CheckCircle2 className="mr-1 size-3" />
                        Complété
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-amber-600 dark:text-amber-400"
                      >
                        <AlertCircle className="mr-1 size-3" />
                        En cours
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/exams/adult/${exam.id}`)}
                      >
                        Voir
                      </Button>
                      {exam.is_completed && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={downloadReport.isPending}
                            onClick={() => downloadReport.mutate(exam.id)}
                            title="Rapport PDF"
                          >
                            <Download className="size-3.5" />
                            <span className="ml-1 hidden sm:inline">
                              Rapport
                            </span>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={downloadConclusion.isPending}
                            onClick={() => downloadConclusion.mutate(exam.id)}
                            title="Conclusion PDF"
                          >
                            <FileText className="size-3.5" />
                            <span className="ml-1 hidden sm:inline">
                              Conclusion
                            </span>
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default function DriverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const driverId = Number(id);
  const [showEditDialog, setShowEditDialog] = useState(
    searchParams.get('edit') === 'true',
  );

  const { data: driver, isLoading } = useDriver(driverId);

  const updateMutation = useUpdateDriver({
    mutationConfig: {
      onSuccess: () => {
        setShowEditDialog(false);
        router.replace(`/conducteurs/${driverId}`);
      },
    },
  });

  if (isLoading) {
    return (
      <Shell title="Conducteur">
        <div className="flex items-center justify-center py-24">
          <Spinner />
        </div>
      </Shell>
    );
  }

  if (!driver) {
    return (
      <Shell title="Conducteur introuvable">
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-muted-foreground">
            Ce conducteur n&apos;existe pas.
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4"
            onClick={() => router.back()}
          >
            Retour
          </Button>
        </div>
      </Shell>
    );
  }

  const editDefaultValues: Partial<DriverCreate> = {
    numero_permis: driver.numero_permis,
    type_permis: driver.type_permis,
    autre_type_permis: driver.autre_type_permis ?? '',
    date_delivrance_permis: driver.date_delivrance_permis,
    date_peremption_permis: driver.date_peremption_permis,
    transporteur_professionnel: driver.transporteur_professionnel,
    service: driver.service,
    annees_experience: driver.annees_experience,
    type_vehicule_conduit: driver.type_vehicule_conduit,
    type_instruction_suivie: driver.type_instruction_suivie,
    niveau_instruction: driver.niveau_instruction,
    prise_en_charge: driver.prise_en_charge ?? null,
    zone_de_residence: driver.zone_de_residence,
  };

  return (
    <Shell title={driver.patient.full_name}>
      {/* Back link */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/conducteurs">
            <ArrowLeft className="mr-1.5 size-4" aria-hidden="true" />
            Retour aux conducteurs
          </Link>
        </Button>
      </div>

      {/* Driver header */}
      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
              <User
                className="size-6 text-muted-foreground"
                aria-hidden="true"
              />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {driver.patient.full_name}
              </h2>
              <div className="mt-1 flex items-center gap-3 text-sm font-medium text-muted-foreground">
                <span className="font-mono">
                  {driver.patient.numero_identifiant}
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {dayjs().diff(
                    dayjs(driver.patient.date_de_naissance),
                    'year',
                  )}{' '}
                  ans
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  {SEX_LABELS[driver.patient.sex] ?? driver.patient.sex}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Conducteur</Badge>
            <Button size="sm" onClick={() => setShowEditDialog(true)}>
              <Edit className="mr-1.5 size-3.5" aria-hidden="true" />
              Modifier
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="identite" className="w-full">
        <TabsList className="w-full justify-start border-b border-border bg-transparent p-0">
          <TabsTrigger
            value="identite"
            className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            État civil & contact
          </TabsTrigger>
          <TabsTrigger
            value="antecedents"
            className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Antécédents médicaux
          </TabsTrigger>
          <TabsTrigger
            value="examens"
            className="rounded-none border-b-2 border-transparent px-4 pb-3 pt-2 data-[state=active]:border-primary data-[state=active]:bg-transparent"
          >
            Examens réalisés
          </TabsTrigger>
        </TabsList>

        {/* Tab: État civil & contact */}
        <TabsContent value="identite" className="mt-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Identité + Permis */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">
                  État civil
                </h3>
                <div className="rounded-lg border border-border bg-card p-4">
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">
                        Nom complet
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
                        {driver.patient.full_name}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">
                        Date de naissance
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
                        {dayjs(driver.patient.date_de_naissance).format(
                          'DD/MM/YYYY',
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">
                        Sexe
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
                        {SEX_LABELS[driver.patient.sex] ?? driver.patient.sex}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">
                        Statut
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
                        {driver.patient.at_risk ? (
                          <Badge variant="destructive" className="text-xs">
                            À risque
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Normal
                          </Badge>
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">Contact</h3>
                <div className="rounded-lg border border-border bg-card p-4">
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">
                        Téléphone
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
                        {driver.patient.phone_number || (
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

            {/* Permis + Activité */}
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">
                  Permis de conduire
                </h3>
                <div className="rounded-lg border border-border bg-card p-4">
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">
                        N° de permis
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
                        {driver.numero_permis}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">
                        Type
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
                        {TYPE_PERMIS_LABELS[driver.type_permis] ??
                          driver.type_permis}
                      </dd>
                    </div>
                    {driver.autre_type_permis && (
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-muted-foreground">
                          Précision
                        </dt>
                        <dd className="text-sm font-medium text-foreground">
                          {driver.autre_type_permis}
                        </dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">
                        Délivré le
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
                        {dayjs(driver.date_delivrance_permis).format(
                          'DD/MM/YYYY',
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">
                        Expire le
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
                        {dayjs(driver.date_peremption_permis).format(
                          'DD/MM/YYYY',
                        )}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-medium text-foreground">
                  Activité professionnelle
                </h3>
                <div className="rounded-lg border border-border bg-card p-4">
                  <dl className="space-y-3">
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">
                        Transporteur professionnel
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
                        {driver.transporteur_professionnel ? 'Oui' : 'Non'}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">
                        Secteur
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
                        {SERVICE_LABELS[driver.service] ?? driver.service}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">
                        Années d&apos;expérience
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
                        {driver.annees_experience}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">
                        Type de véhicule
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
                        {VEHICULE_LABELS[driver.type_vehicule_conduit] ??
                          driver.type_vehicule_conduit}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">
                        Instruction suivie
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
                        {driver.type_instruction_suivie}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">
                        Niveau d&apos;instruction
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
                        {NIVEAU_LABELS[driver.niveau_instruction] ??
                          driver.niveau_instruction}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-sm font-medium text-muted-foreground">
                        Zone de résidence
                      </dt>
                      <dd className="text-sm font-medium text-foreground">
                        {driver.zone_de_residence}
                      </dd>
                    </div>
                    {driver.prise_en_charge && (
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-muted-foreground">
                          Prise en charge
                        </dt>
                        <dd className="text-sm font-medium text-foreground">
                          {driver.prise_en_charge}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Antécédents médicaux */}
        <TabsContent value="antecedents" className="mt-6">
          <MedicalHistoryForm patientId={driver.patient.id} hasDriver />
        </TabsContent>

        {/* Tab: Examens réalisés */}
        <TabsContent value="examens" className="mt-6">
          <ExamsTab patientId={driver.patient.id} />
        </TabsContent>
      </Tabs>

      {/* Edit dialog */}
      <Dialog
        open={showEditDialog}
        onOpenChange={(open) => {
          if (!open) setShowEditDialog(false);
        }}
      >
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le conducteur</DialogTitle>
            <DialogDescription>
              Modifier les informations de{' '}
              <span className="font-semibold">{driver.patient.full_name}</span>.
            </DialogDescription>
          </DialogHeader>
          <DriverForm
            isEdit
            defaultValues={editDefaultValues}
            onSubmit={(data) => updateMutation.mutate({ id: driverId, data })}
            isPending={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </Shell>
  );
}
