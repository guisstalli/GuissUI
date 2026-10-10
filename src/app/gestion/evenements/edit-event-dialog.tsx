'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { EventFormFields } from '@/app/gestion/evenements/event-form-fields';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import { Form } from '@/components/ui/form/form';
import { useNotifications } from '@/components/ui/notifications';
import { useUpdateEvent } from '@/features/events/api/update-event';
import {
  EventCreateInputSchema,
  type EventCreateInput,
  type EventStaff,
} from '@/features/events/types/schemas';

/** Les champs `time` attendent HH:MM ; l'API renvoie HH:MM:SS. */
const heure = (valeur: string) => valeur.slice(0, 5);

const valeursDe = (event: EventStaff): EventCreateInput => ({
  titre: event.titre,
  date_event: event.date_event,
  date_fin: event.date_fin ?? '',
  heure_debut: heure(event.heure_debut),
  heure_fin: heure(event.heure_fin),
  lieu: event.lieu,
  type_examen: event.type_examen,
  capacite_max: event.capacite_max,
  description: event.description,
  pour_conducteurs: event.pour_conducteurs,
  // Un événement créé avant que le site ne soit requis n'en a pas : le
  // formulaire le demandera, c'est l'occasion de le rattacher.
  site_id: event.site_id ?? (undefined as unknown as number),
});

interface EditEventDialogProps {
  event: EventStaff;
  ouvert: boolean;
  onOuvertChange: (ouvert: boolean) => void;
}

/**
 * Modifier un événement planifié.
 *
 * Mêmes champs que la création, pré-remplis. Une fois l'événement démarré,
 * le menu ne propose plus cette action : changer la date ou le site en cours
 * de route ne dirait plus la vérité sur ce qui s'est passé.
 */
export function EditEventDialog({
  event,
  ouvert,
  onOuvertChange,
}: EditEventDialogProps) {
  const { addNotification } = useNotifications();
  const form = useForm<EventCreateInput>({
    resolver: zodResolver(EventCreateInputSchema),
    defaultValues: valeursDe(event),
  });

  // Rouvrir la fenêtre doit montrer l'événement tel qu'il est, pas la saisie
  // abandonnée la fois précédente.
  useEffect(() => {
    if (ouvert) form.reset(valeursDe(event));
  }, [ouvert, event, form]);

  const { mutate: enregistrer, isPending } = useUpdateEvent({
    onSuccess: () => {
      onOuvertChange(false);
      addNotification({
        type: 'success',
        title: 'Événement modifié',
        message: `« ${form.getValues('titre')} » a été mis à jour.`,
      });
    },
  });

  return (
    <Dialog open={ouvert} onOpenChange={onOuvertChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Modifier l&apos;événement</DialogTitle>
          <DialogDescription>
            Les patients déjà enregistrés gardent le site qu&apos;ils ont reçu.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) =>
              enregistrer({
                eventId: event.id,
                data: { ...v, date_fin: v.date_fin || null },
              }),
            )}
            className="space-y-4"
          >
            <EventFormFields form={form} />
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOuvertChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
