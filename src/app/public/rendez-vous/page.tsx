'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { PublicShell } from '@/components/public/public-shell';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useBookAppointment } from '@/features/appointments/api/book-appointment';
import { ConfirmationPage } from '@/features/appointments/components/booking/confirmation-page';
import { DateStep } from '@/features/appointments/components/booking/date-step';
import { InfoStep } from '@/features/appointments/components/booking/info-step';
import { SlotStep } from '@/features/appointments/components/booking/slot-step';
import {
  StepIndicator,
  type Step,
} from '@/features/appointments/components/booking/step-indicator';
import { MOTIF_AUTRE_VALUE } from '@/features/appointments/types/motifs';
import {
  ReservationFormSchema,
  type RendezVousConfirmation,
  type ReservationFormInput,
  type ReservationInput,
} from '@/features/appointments/types/schemas';

export default function RendezVousPage() {
  const [step, setStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [confirmation, setConfirmation] =
    useState<RendezVousConfirmation | null>(null);
  const [confirmedReminder, setConfirmedReminder] = useState(true);

  const form = useForm<ReservationFormInput>({
    resolver: zodResolver(ReservationFormSchema),
    defaultValues: {
      date: '',
      heure_debut: '',
      patient_nom: '',
      patient_prenom: '',
      patient_phone: '',
      patient_email: '',
      motif: '',
      motif_autre: '',
      want_reminder: true,
    },
  });

  const {
    mutate: bookAppointment,
    isPending,
    error: bookError,
  } = useBookAppointment({
    onSuccess: (data) => setConfirmation(data),
  });

  function handleDateSelect(date: string) {
    setSelectedDate(date);
    setSelectedSlot(null);
    form.setValue('date', date);
  }

  function handleSlotSelect(slot: string) {
    setSelectedSlot(slot);
    form.setValue('heure_debut', slot);
  }

  function handleSubmit(values: ReservationFormInput) {
    const { motif_autre, motif, ...rest } = values;
    // « Autre » remplace le motif par le texte libre saisi juste en dessous.
    const finalMotif =
      motif === MOTIF_AUTRE_VALUE ? (motif_autre?.trim() ?? '') : motif;

    // `motif` est OBLIGATOIRE et toujours transmis. Il était auparavant omis
    // quand il était vide : le rendez-vous se créait alors sans motif, et sa
    // confirmation WhatsApp échouait ensuite en silence (Meta refuse un modèle
    // dont une variable est vide — erreur Twilio 21656).
    // La validation Zod garantit qu'on n'arrive pas ici avec une chaîne vide.
    const payload: ReservationInput = { ...rest, motif: finalMotif };

    setConfirmedReminder(values.want_reminder);
    bookAppointment(payload);
  }

  if (confirmation) {
    return (
      <ConfirmationPage
        confirmation={confirmation}
        wantReminder={confirmedReminder}
      />
    );
  }

  // Le bouton « Continuer » n'apparaît qu'aux étapes date/slot.
  const canContinue =
    (step === 'date' && !!selectedDate) || (step === 'slot' && !!selectedSlot);

  return (
    <PublicShell>
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        {/* header */}
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-foreground">
            Prendre un rendez-vous
          </h1>
          <p className="text-muted-foreground">
            Consultation ophtalmologique — Service UIDT
          </p>
        </div>

        {/* stepper */}
        <div className="mb-10">
          <StepIndicator current={step} />
        </div>

        {/* step content card */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} id="rdv-form">
            <div className="min-h-[280px] rounded-2xl border border-border bg-card p-6 sm:p-8">
              {step === 'date' && (
                <DateStep
                  selectedDate={selectedDate}
                  onSelect={handleDateSelect}
                />
              )}
              {step === 'slot' && selectedDate && (
                <SlotStep
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                  onSelect={handleSlotSelect}
                />
              )}
              {step === 'info' && selectedSlot && (
                <InfoStep
                  form={form}
                  selectedDate={selectedDate}
                  selectedSlot={selectedSlot}
                />
              )}
            </div>

            {/* error */}
            {bookError && step === 'info' && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-400/20 dark:bg-red-400/[0.06] dark:text-red-400">
                {bookError instanceof Error
                  ? bookError.message
                  : "Une erreur s'est produite. Vérifiez vos informations et réessayez."}
              </div>
            )}

            {/* navigation */}
            <div className="mt-6 flex items-center justify-between gap-4">
              {/* left */}
              {step === 'date' ? (
                <Link
                  href="/public/evenements"
                  className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  <ArrowLeft className="size-4" />
                  Voir les événements
                </Link>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (step === 'slot') setStep('date');
                    else if (step === 'info') setStep('slot');
                  }}
                >
                  <ArrowLeft className="mr-1.5 size-4" />
                  Retour
                </Button>
              )}

              {/* right */}
              {step !== 'info' ? (
                <Button
                  type="button"
                  disabled={!canContinue}
                  className="bg-cyan-500 font-semibold text-white hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.25)] disabled:opacity-40 dark:bg-cyan-400 dark:text-slate-900 dark:hover:bg-cyan-300"
                  onClick={() => {
                    if (step === 'date') setStep('slot');
                    else if (step === 'slot') setStep('info');
                  }}
                >
                  Continuer
                </Button>
              ) : (
                <Button
                  type="submit"
                  form="rdv-form"
                  disabled={isPending}
                  className="bg-cyan-500 font-semibold text-white hover:bg-cyan-400 hover:shadow-[0_0_20px_rgba(34,211,238,0.25)] disabled:opacity-60 dark:bg-cyan-400 dark:text-slate-900 dark:hover:bg-cyan-300"
                >
                  {isPending ? (
                    <>
                      <span className="mr-2 size-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white dark:border-slate-900/30 dark:border-t-slate-900" />
                      Réservation…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-1.5 size-4" />
                      Confirmer le rendez-vous
                    </>
                  )}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </div>
    </PublicShell>
  );
}
