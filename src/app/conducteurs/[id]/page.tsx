'use client';

import dayjs from 'dayjs';
import { ArrowLeft, Calendar, Car, Edit, MapPin, User } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

import { AppShell as Shell } from '@/app/_shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import { Spinner } from '@/components/ui/spinner';
import { useDriver } from '@/features/drivers/api/get-driver';
import { useUpdateDriver } from '@/features/drivers/api/update-driver';
import { DriverForm } from '@/features/drivers/components/driver-form';
import type { DriverCreate } from '@/features/drivers/types/schemas';

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

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium">{value ?? '—'}</span>
    </div>
  );
}

export default function DriverDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const driverId = Number(id);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const { data: driver, isLoading } = useDriver(driverId);

  const updateMutation = useUpdateDriver({
    mutationConfig: { onSuccess: () => setShowEditDialog(false) },
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/conducteurs">
              <ArrowLeft className="mr-1.5 size-4" />
              Retour
            </Link>
          </Button>
          <Button size="sm" onClick={() => setShowEditDialog(true)}>
            <Edit className="mr-1.5 size-3.5" />
            Modifier
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {/* Patient */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="size-4" />
                Informations patient
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              <InfoRow label="Nom complet" value={driver.patient.full_name} />
              <InfoRow
                label="N° identifiant"
                value={driver.patient.numero_identifiant}
              />
              <InfoRow
                label="Sexe"
                value={SEX_LABELS[driver.patient.sex] ?? driver.patient.sex}
              />
              <InfoRow
                label="Date de naissance"
                value={dayjs(driver.patient.date_de_naissance).format(
                  'DD/MM/YYYY',
                )}
              />
              <InfoRow label="Téléphone" value={driver.patient.phone_number} />
              <InfoRow
                label="Statut"
                value={
                  driver.patient.at_risk ? (
                    <Badge variant="destructive" className="text-xs">
                      À risque
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Normal
                    </Badge>
                  )
                }
              />
            </CardContent>
          </Card>

          {/* Permis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="size-4" />
                Permis de conduire
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              <InfoRow label="N° de permis" value={driver.numero_permis} />
              <InfoRow
                label="Type"
                value={
                  TYPE_PERMIS_LABELS[driver.type_permis] ?? driver.type_permis
                }
              />
              {driver.autre_type_permis && (
                <InfoRow label="Précision" value={driver.autre_type_permis} />
              )}
              <InfoRow
                label="Délivré le"
                value={dayjs(driver.date_delivrance_permis).format(
                  'DD/MM/YYYY',
                )}
              />
              <InfoRow
                label="Expire le"
                value={dayjs(driver.date_peremption_permis).format(
                  'DD/MM/YYYY',
                )}
              />
            </CardContent>
          </Card>

          {/* Activité */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Car className="size-4" />
                Activité professionnelle
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              <InfoRow
                label="Transporteur professionnel"
                value={driver.transporteur_professionnel ? 'Oui' : 'Non'}
              />
              <InfoRow
                label="Secteur"
                value={SERVICE_LABELS[driver.service] ?? driver.service}
              />
              <InfoRow
                label="Années d'expérience"
                value={driver.annees_experience}
              />
              <InfoRow
                label="Type de véhicule"
                value={
                  VEHICULE_LABELS[driver.type_vehicule_conduit] ??
                  driver.type_vehicule_conduit
                }
              />
              <InfoRow label="Prise en charge" value={driver.prise_en_charge} />
            </CardContent>
          </Card>

          {/* Profil */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MapPin className="size-4" />
                Profil
              </CardTitle>
            </CardHeader>
            <CardContent className="divide-y">
              <InfoRow
                label="Type d'instruction"
                value={driver.type_instruction_suivie}
              />
              <InfoRow
                label="Niveau d'instruction"
                value={
                  NIVEAU_LABELS[driver.niveau_instruction] ??
                  driver.niveau_instruction
                }
              />
              <InfoRow
                label="Zone de résidence"
                value={driver.zone_de_residence}
              />
            </CardContent>
          </Card>
        </div>
      </div>

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
