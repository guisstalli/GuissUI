'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useNotifications } from '@/components/ui/notifications';

import { useCreateDriverForPatient } from '../api/create-driver-for-patient';
import type { DriverCreate } from '../types/schemas';

import { DriverForm } from './driver-form';

/** Les quatre champs recueillis auprès du public sur un événement conducteurs. */
export type DriverEssentials = {
  numero_permis?: string | null;
  type_permis?: string | null;
  service?: string | null;
  zone_de_residence?: string | null;
};

type DriverRecordDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: number;
  patientNom: string;
  /** Ce que la personne a saisi en ligne. Null si l'événement n'était pas
   *  « pour conducteurs » ou si elle n'a rien renseigné. */
  driverData: DriverEssentials | null;
  onCreated?: () => void;
};

/**
 * Complète le dossier conducteur d'un patient issu d'un check-in d'événement.
 *
 * Le formulaire public ne recueille que quatre champs — le dossier complet en
 * exige onze. Le staff complète le reste ici, sans ressaisir ce qui a déjà été
 * fourni en ligne : `driver_data` remonte jusqu'à l'écran et pré-remplit le
 * formulaire. Sans ce câblage, ces données arrivaient jusqu'en base et
 * n'étaient jamais lues.
 *
 * L'état civil est masqué : le patient existe déjà, créé au check-in. C'est
 * aussi pourquoi la soumission passe par `patient_id` et non par un patient
 * imbriqué, qui produirait un doublon.
 */
export function DriverRecordDialog({
  open,
  onOpenChange,
  patientId,
  patientNom,
  driverData,
  onCreated,
}: DriverRecordDialogProps) {
  const { addNotification } = useNotifications();

  const { mutate, isPending } = useCreateDriverForPatient({
    mutationConfig: {
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Dossier conducteur créé',
          message: `Le dossier de ${patientNom} est enregistré.`,
        });
        onOpenChange(false);
        onCreated?.();
      },
    },
  });

  // Une chaîne vide venue du serveur ne doit pas écraser le défaut du
  // formulaire : `allow_blank=True` côté API rend ce cas courant.
  const valeur = (v: string | null | undefined) =>
    v && v.trim() ? v.trim() : undefined;

  const prefill: Partial<DriverCreate> = {
    ...(valeur(driverData?.numero_permis) && {
      numero_permis: valeur(driverData?.numero_permis),
    }),
    ...(valeur(driverData?.type_permis) && {
      type_permis: valeur(
        driverData?.type_permis,
      ) as DriverCreate['type_permis'],
    }),
    ...(valeur(driverData?.service) && {
      service: valeur(driverData?.service) as DriverCreate['service'],
    }),
    ...(valeur(driverData?.zone_de_residence) && {
      zone_de_residence: valeur(
        driverData?.zone_de_residence,
      ) as DriverCreate['zone_de_residence'],
    }),
  };

  const soumettre = (data: DriverCreate) => {
    // `patient` est écarté : l'endpoint prend un patient_id.
    const { patient: _patient, ...champsConducteur } = data;
    mutate({ ...champsConducteur, patient_id: patientId });
  };

  const nbPreremplis = Object.keys(prefill).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-screen-md">
        <DialogHeader>
          <DialogTitle>Dossier conducteur — {patientNom}</DialogTitle>
          <DialogDescription>
            {nbPreremplis > 0
              ? `${nbPreremplis} champ${nbPreremplis > 1 ? 's' : ''} pré-rempli${nbPreremplis > 1 ? 's' : ''} depuis l'inscription en ligne. Vérifiez-les sur pièce, puis complétez.`
              : "Aucune donnée conducteur n'a été fournie en ligne. Renseignez le dossier complet."}
          </DialogDescription>
        </DialogHeader>

        <DriverForm
          defaultValues={prefill}
          hidePatientSection
          submitLabel="Créer le dossier conducteur"
          isPending={isPending}
          onSubmit={soumettre}
        />
      </DialogContent>
    </Dialog>
  );
}
