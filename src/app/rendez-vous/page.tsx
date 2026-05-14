'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  Phone,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useBookAppointment } from '@/features/appointments/api/book-appointment';
import { useDisponibilites } from '@/features/appointments/api/get-disponibilites';
import type {
  RendezVousConfirmation,
  ReservationInput,
} from '@/features/appointments/types/schemas';
import { ReservationInputSchema } from '@/features/appointments/types/schemas';
import { cn } from '@/lib/utils';

type Step = 'date' | 'slot' | 'info' | 'confirm';

const STEPS: {
  id: Step;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: 'date', label: 'Date', icon: Calendar },
  { id: 'slot', label: 'Créneau', icon: Clock },
  { id: 'info', label: 'Informations', icon: User },
  { id: 'confirm', label: 'Confirmation', icon: CheckCircle2 },
];

function StepIndicator({ current }: { current: Step }) {
  const currentIdx = STEPS.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center justify-center gap-0">
      {STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        const Icon = step.icon;
        return (
          <div key={step.id} className="flex items-center">
            <div
              className={cn(
                'flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                done && 'bg-blue-600 text-white',
                active && 'bg-blue-600 text-white ring-4 ring-blue-100',
                !done && !active && 'bg-slate-100 text-slate-400',
              )}
            >
              {done ? (
                <CheckCircle2 className="size-5" />
              ) : (
                <Icon className="size-4" />
              )}
            </div>
            <p
              className={cn(
                'ml-2 hidden text-sm font-medium sm:block',
                active
                  ? 'text-blue-700'
                  : done
                    ? 'text-slate-700'
                    : 'text-slate-400',
              )}
            >
              {step.label}
            </p>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-3 h-0.5 w-8 sm:w-12 rounded-full transition-colors',
                  done ? 'bg-blue-600' : 'bg-slate-200',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function ConfirmationPage({
  confirmation,
}: {
  confirmation: RendezVousConfirmation;
}) {
  return (
    <div className="mx-auto max-w-md text-center">
      <div className="mb-8 flex justify-center">
        <div className="flex size-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="size-10 text-emerald-600" />
        </div>
      </div>
      <h2 className="mb-3 text-2xl font-bold text-slate-900">
        Rendez-vous confirmé !
      </h2>
      <p className="mb-8 text-slate-500">
        Bonjour{' '}
        <strong>
          {confirmation.patient_prenom} {confirmation.patient_nom}
        </strong>
        , votre rendez-vous a bien été enregistré.
      </p>

      <div className="mb-8 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50">
            <Calendar className="size-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Date</p>
            <p className="font-semibold text-slate-900">
              {new Date(confirmation.date).toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50">
            <Clock className="size-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Horaire</p>
            <p className="font-semibold text-slate-900">
              {confirmation.heure_debut.slice(0, 5)} –{' '}
              {confirmation.heure_fin.slice(0, 5)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-blue-50">
            <Phone className="size-4 text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Téléphone</p>
            <p className="font-semibold text-slate-900">
              {confirmation.patient_phone}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-800">
        <p className="mb-1 font-semibold">
          Numéro de RDV : {confirmation.numero_rdv}
        </p>
        <p>Un rappel SMS vous sera envoyé avant votre rendez-vous.</p>
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Pour annuler :{' '}
        <Link
          href={`/rendez-vous/annuler/${confirmation.token_annulation}`}
          className="text-red-500 hover:underline"
        >
          cliquer ici
        </Link>
      </p>

      <Link
        href="/evenements"
        className="mt-8 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
      >
        <ArrowLeft className="size-4" />
        Voir les événements de dépistage
      </Link>
    </div>
  );
}

export default function RendezVousPublicPage() {
  const [step, setStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [confirmation, setConfirmation] =
    useState<RendezVousConfirmation | null>(null);

  const dateStr = selectedDate || null;
  const { data: dispos, isLoading: loadingSlots } = useDisponibilites(
    step === 'slot' || step === 'info' ? dateStr : null,
  );

  const form = useForm<ReservationInput>({
    resolver: zodResolver(ReservationInputSchema),
    defaultValues: {
      date: '',
      heure_debut: '',
      patient_nom: '',
      patient_prenom: '',
      patient_phone: '',
      patient_email: '',
      motif: '',
      want_reminder: true,
    },
  });

  const {
    mutate: book,
    isPending,
    error: bookError,
  } = useBookAppointment({
    onSuccess: (data) => {
      setConfirmation(data);
      setStep('confirm');
    },
  });

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedSlot(null);
  };

  const handleNext = () => {
    if (step === 'date' && selectedDate) {
      form.setValue('date', selectedDate);
      setStep('slot');
    } else if (step === 'slot' && selectedSlot) {
      form.setValue('heure_debut', selectedSlot);
      setStep('info');
    }
  };

  const handleSubmit = form.handleSubmit((values) => {
    book(values);
  });

  if (confirmation) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-3xl items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-blue-600">
                <Eye className="size-3.5 text-white" />
              </div>
              <span className="font-bold text-slate-900">
                GUISS Ophtalmologie
              </span>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-3xl px-4 py-12">
          <ConfirmationPage confirmation={confirmation} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between p-4">
          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-blue-600">
              <Eye className="size-3.5 text-white" />
            </div>
            <span className="font-bold text-slate-900">
              GUISS Ophtalmologie
            </span>
          </div>
          <Link
            href="/evenements"
            className="text-sm text-slate-500 transition-colors hover:text-slate-900"
          >
            Voir les événements
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="mb-2 text-3xl font-extrabold text-slate-900">
            Prendre un rendez-vous
          </h1>
          <p className="text-slate-500">
            Consultation ophtalmologique — Service Ophtalmologie, UIDT
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-10">
          <StepIndicator current={step} />
        </div>

        {/* Step content */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          {step === 'date' && (
            <div>
              <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
                <Calendar className="size-5 text-blue-600" />
                Choisissez une date
              </h2>
              <div className="mx-auto max-w-xs space-y-3">
                <label
                  className="block text-sm font-medium text-slate-700"
                  htmlFor="rdv-date"
                >
                  Choisissez une date
                </label>
                <input
                  id="rdv-date"
                  type="date"
                  title="Date du rendez-vous"
                  min={format(new Date(), 'yyyy-MM-dd')}
                  value={selectedDate}
                  onChange={(e) => handleDateSelect(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-lg text-slate-900 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                {selectedDate && (
                  <p className="text-center text-sm font-medium text-blue-700">
                    Sélectionné :{' '}
                    {new Date(selectedDate + 'T12:00:00').toLocaleDateString(
                      'fr-FR',
                      {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                      },
                    )}
                  </p>
                )}
              </div>
            </div>
          )}

          {step === 'slot' && (
            <div>
              <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-slate-900">
                <Clock className="size-5 text-blue-600" />
                Choisissez un créneau
              </h2>
              <p className="mb-6 text-sm text-slate-500">
                {selectedDate &&
                  new Date(selectedDate + 'T12:00:00').toLocaleDateString(
                    'fr-FR',
                    {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    },
                  )}
              </p>

              {loadingSlots ? (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <Skeleton key={i} className="h-11 rounded-xl" />
                  ))}
                </div>
              ) : !dispos?.slots?.length ? (
                <div className="rounded-xl bg-amber-50 p-6 text-center">
                  <p className="font-medium text-amber-800">
                    Aucun créneau disponible
                  </p>
                  <p className="mt-1 text-sm text-amber-600">
                    Essayez une autre date.
                  </p>
                  <button
                    onClick={() => setStep('date')}
                    className="mt-3 text-sm text-blue-600 hover:underline"
                  >
                    ← Changer de date
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {dispos.slots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        'rounded-xl border-2 px-3 py-2.5 text-sm font-semibold transition-all',
                        selectedSlot === slot
                          ? 'border-blue-600 bg-blue-600 text-white shadow-md'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50',
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === 'info' && (
            <div>
              <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-slate-900">
                <User className="size-5 text-blue-600" />
                Vos informations
              </h2>
              <Form {...form}>
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                  id="rdv-form"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="patient_prenom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prénom</FormLabel>
                          <FormControl>
                            <Input placeholder="Fatou" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="patient_nom"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nom</FormLabel>
                          <FormControl>
                            <Input placeholder="Diallo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="patient_phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="+221 77 000 00 00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="patient_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (optionnel)</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="fatou@example.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="motif"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Motif (optionnel)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: bilan visuel, renouvellement lunettes..."
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Summary */}
                  <div className="mt-2 rounded-xl bg-slate-50 p-4 text-sm">
                    <p className="mb-2 font-semibold text-slate-700">
                      Récapitulatif
                    </p>
                    <div className="grid grid-cols-2 gap-1 text-slate-500">
                      <span>Date :</span>
                      <span className="font-medium text-slate-700">
                        {selectedDate &&
                          new Date(
                            selectedDate + 'T12:00:00',
                          ).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                          })}
                      </span>
                      <span>Heure :</span>
                      <span className="font-medium text-slate-700">
                        {selectedSlot}
                      </span>
                    </div>
                  </div>

                  {bookError && (
                    <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                      {(
                        bookError as {
                          response?: { data?: { detail?: string } };
                        }
                      )?.response?.data?.detail ??
                        "Une erreur s'est produite. Vérifiez vos informations."}
                    </p>
                  )}
                </form>
              </Form>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          {step !== 'date' ? (
            <Button
              variant="outline"
              onClick={() => {
                if (step === 'slot') setStep('date');
                else if (step === 'info') setStep('slot');
              }}
              className="gap-2"
            >
              <ArrowLeft className="size-4" />
              Retour
            </Button>
          ) : (
            <Link
              href="/evenements"
              className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="size-4" />
              Voir les événements
            </Link>
          )}

          {step === 'date' && (
            <Button
              onClick={handleNext}
              disabled={!selectedDate}
              className="gap-2"
            >
              Continuer
              <ArrowRight className="size-4" />
            </Button>
          )}
          {step === 'slot' && (
            <Button
              onClick={handleNext}
              disabled={!selectedSlot}
              className="gap-2"
            >
              Continuer
              <ArrowRight className="size-4" />
            </Button>
          )}
          {step === 'info' && (
            <Button
              type="submit"
              form="rdv-form"
              disabled={isPending}
              className="gap-2"
              onClick={handleSubmit}
            >
              {isPending ? 'Réservation...' : 'Confirmer le rendez-vous'}
              <CheckCircle2 className="size-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
