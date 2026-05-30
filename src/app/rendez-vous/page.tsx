'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Phone,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { PublicShell } from '@/components/public/public-shell';
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
import { Switch } from '@/components/ui/switch';
import { useBookAppointment } from '@/features/appointments/api/book-appointment';
import { useDisponibilites } from '@/features/appointments/api/get-disponibilites';
import type {
  RendezVousConfirmation,
  ReservationInput,
} from '@/features/appointments/types/schemas';
import { ReservationInputSchema } from '@/features/appointments/types/schemas';
import { cn } from '@/lib/utils';

/* ─── helpers ─────────────────────────────────────────────────────────────── */

type Step = 'date' | 'slot' | 'info';

const STEPS: { id: Step; label: string }[] = [
  { id: 'date', label: 'Date' },
  { id: 'slot', label: 'Créneau' },
  { id: 'info', label: 'Informations' },
];

function formatSlot(slot: string) {
  return slot.slice(0, 5);
}

function formatDateFr(dateStr: string) {
  try {
    return format(new Date(dateStr), 'EEEE d MMMM yyyy', { locale: fr });
  } catch {
    return dateStr;
  }
}

/* ─── step indicator ──────────────────────────────────────────────────────── */

function StepIndicator({ current }: { current: Step }) {
  const currentIdx = STEPS.findIndex((s) => s.id === current);

  return (
    <div className="flex items-center justify-center">
      {STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = step.id === current;

        return (
          <div key={step.id} className="flex items-center">
            {/* circle */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'flex size-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300',
                  done &&
                    'border-emerald-500/50 bg-emerald-50 text-emerald-600 dark:border-emerald-400/50 dark:bg-emerald-400/[0.12] dark:text-emerald-400',
                  active &&
                    'border-cyan-500 bg-cyan-50 text-cyan-700 dark:border-cyan-400/60 dark:bg-cyan-400/[0.15] dark:text-cyan-300',
                  !done &&
                    !active &&
                    'border-border bg-transparent text-muted-foreground',
                )}
                style={
                  active
                    ? { boxShadow: '0 0 18px rgba(34,211,238,0.15)' }
                    : undefined
                }
              >
                {done ? <CheckCircle2 className="size-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  'hidden text-xs font-medium sm:block',
                  active
                    ? 'text-cyan-600 dark:text-cyan-400'
                    : done
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>

            {/* connector */}
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-3 mb-5 h-px w-12 rounded-full transition-all duration-300 sm:w-20',
                  done ? 'bg-emerald-400/50' : 'bg-border dark:bg-white/[0.08]',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ─── date step ───────────────────────────────────────────────────────────── */

function DateStep({
  selectedDate,
  onSelect,
}: {
  selectedDate: string;
  onSelect: (d: string) => void;
}) {
  const today = format(new Date(), 'yyyy-MM-dd');

  return (
    <div>
      <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-foreground">
        <Calendar className="size-5 text-cyan-500 dark:text-cyan-400" />
        Choisissez une date
      </h2>
      <p className="mb-8 text-sm text-muted-foreground">
        Sélectionnez le jour souhaité pour votre consultation.
      </p>

      <div className="mx-auto max-w-xs">
        <label
          htmlFor="date-input"
          className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted-foreground"
        >
          Date souhaitée
        </label>
        <input
          id="date-input"
          type="date"
          min={today}
          value={selectedDate}
          onChange={(e) => onSelect(e.target.value)}
          className="h-12 w-full rounded-xl border border-input bg-background px-4 text-base font-medium text-foreground transition-all focus:border-cyan-500/50 focus:bg-background focus:outline-none focus:ring-0"
        />
        {selectedDate && (
          <p className="mt-3 text-center text-sm font-medium capitalize text-cyan-600 dark:text-cyan-400">
            {formatDateFr(selectedDate)}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── slot step ───────────────────────────────────────────────────────────── */

function SlotStep({
  selectedDate,
  selectedSlot,
  onSelect,
}: {
  selectedDate: string;
  selectedSlot: string | null;
  onSelect: (s: string) => void;
}) {
  const { data: dispos, isLoading } = useDisponibilites(selectedDate);

  const morning = (dispos?.slots ?? []).filter(
    (s) => parseInt(s.split(':')[0]) < 12,
  );
  const afternoon = (dispos?.slots ?? []).filter(
    (s) => parseInt(s.split(':')[0]) >= 12,
  );

  function SlotGrid({ slots }: { slots: string[] }) {
    return (
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {slots.map((slot) => (
          <button
            type="button"
            key={slot}
            onClick={() => onSelect(slot)}
            className={cn(
              'rounded-xl border-2 py-3 text-sm font-semibold transition-all duration-150',
              selectedSlot === slot
                ? 'border-cyan-500 bg-cyan-50 text-cyan-700 dark:border-cyan-400/60 dark:bg-cyan-400/[0.15] dark:text-cyan-300'
                : 'border-border bg-background text-muted-foreground hover:border-border/60 hover:bg-muted/50 hover:text-foreground dark:border-white/[0.10] dark:bg-white/[0.03] dark:hover:border-white/[0.25] dark:hover:bg-white/[0.07]',
            )}
            style={
              selectedSlot === slot
                ? { boxShadow: '0 0 14px rgba(34,211,238,0.1)' }
                : undefined
            }
          >
            {formatSlot(slot)}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-foreground">
        <Clock className="size-5 text-cyan-500 dark:text-cyan-400" />
        Choisissez un créneau
      </h2>
      <p className="mb-6 text-sm capitalize text-muted-foreground">
        {formatDateFr(selectedDate)}
      </p>

      {isLoading ? (
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-11 rounded-xl" />
          ))}
        </div>
      ) : !dispos?.slots?.length ? (
        <div className="rounded-xl border border-amber-400/20 bg-amber-50 p-6 text-center dark:bg-amber-400/[0.06]">
          <p className="font-semibold text-amber-600 dark:text-amber-400">
            Aucun créneau disponible
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Essayez une autre date.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {morning.length > 0 && (
            <div>
              {morning.length > 0 && afternoon.length > 0 && (
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  ☀︎ Matin
                </p>
              )}
              <SlotGrid slots={morning} />
            </div>
          )}
          {afternoon.length > 0 && (
            <div>
              {morning.length > 0 && afternoon.length > 0 && (
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  ◑ Après-midi
                </p>
              )}
              <SlotGrid slots={afternoon} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── info step ───────────────────────────────────────────────────────────── */

function InfoStep({
  form,
  selectedDate,
  selectedSlot,
}: {
  form: ReturnType<typeof useForm<ReservationInput>>;
  selectedDate: string;
  selectedSlot: string;
}) {
  return (
    <div>
      <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-foreground">
        <User className="size-5 text-cyan-500 dark:text-cyan-400" />
        Vos informations
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Renseignez vos coordonnées pour confirmer votre rendez-vous.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="patient_prenom"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">
                  Prénom *
                </FormLabel>
                <FormControl>
                  <Input placeholder="Fatou" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="patient_nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">
                  Nom *
                </FormLabel>
                <FormControl>
                  <Input placeholder="Diallo" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="patient_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-muted-foreground">
                Téléphone *
              </FormLabel>
              <FormControl>
                <Input placeholder="+221 77 000 00 00" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="patient_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-muted-foreground">
                Email (optionnel)
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="fatou@example.com"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="motif"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-muted-foreground">
                Motif (optionnel)
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="Ex: bilan visuel, renouvellement…"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* want_reminder toggle */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
          <div className="flex items-start gap-3">
            <Phone className="mt-0.5 size-4 shrink-0 text-cyan-500/70 dark:text-cyan-400/70" />
            <div>
              <p className="text-sm font-medium text-foreground">Rappel SMS</p>
              <p className="text-xs text-muted-foreground">
                Recevez un rappel avant votre rendez-vous
              </p>
            </div>
          </div>
          <Controller
            name="want_reminder"
            control={form.control}
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>

        {/* summary */}
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-50/60 p-4 dark:border-cyan-400/15 dark:bg-cyan-400/[0.04]">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Récapitulatif
          </p>
          <div className="grid grid-cols-2 gap-y-1.5 text-sm">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium capitalize text-foreground">
              {formatDateFr(selectedDate)}
            </span>
            <span className="text-muted-foreground">Heure</span>
            <span className="font-medium text-cyan-600 dark:text-cyan-400">
              {formatSlot(selectedSlot)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── confirmation page ───────────────────────────────────────────────────── */

function ConfirmationPage({
  confirmation,
}: {
  confirmation: RendezVousConfirmation;
}) {
  return (
    <PublicShell>
      <div className="flex min-h-[calc(100vh-72px)] items-center justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-md text-center">
          {/* animated checkmark */}
          <div
            className="mx-auto mb-8 flex size-24 items-center justify-center rounded-full border-2 border-emerald-500/30 bg-emerald-50 dark:border-emerald-400/30 dark:bg-emerald-400/[0.08]"
            style={{
              animation: 'popIn 0.6s cubic-bezier(0.34,1.56,0.64,1) both',
            }}
          >
            <CheckCircle2 className="size-12 text-emerald-500 dark:text-emerald-400" />
          </div>

          <h2 className="mb-3 text-3xl font-bold text-foreground">
            Rendez-vous confirmé !
          </h2>
          <p className="mb-8 text-muted-foreground">
            Bonjour{' '}
            <span className="font-semibold text-foreground">
              {confirmation.patient_prenom} {confirmation.patient_nom}
            </span>
            , votre consultation a bien été enregistrée.
          </p>

          {/* details card */}
          <div className="mb-6 space-y-3 rounded-2xl border border-border bg-card p-6 text-left">
            {[
              {
                icon: Calendar,
                label: 'Date',
                value: (
                  <span className="capitalize">
                    {formatDateFr(confirmation.date)}
                  </span>
                ),
              },
              {
                icon: Clock,
                label: 'Horaire',
                value: `${formatSlot(confirmation.heure_debut)} – ${formatSlot(confirmation.heure_fin)}`,
              },
              {
                icon: Phone,
                label: 'Téléphone',
                value: confirmation.patient_phone,
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-cyan-500/15 bg-cyan-50 dark:border-cyan-400/15 dark:bg-cyan-400/[0.08]">
                  <Icon className="size-3.5 text-cyan-600 dark:text-cyan-400" />
                </div>
                <div className="flex flex-1 justify-between">
                  <span className="text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm font-medium text-foreground">
                    {value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* RDV number */}
          <div
            className="mb-4 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] px-6 py-4"
            style={{ boxShadow: '0 0 32px rgba(34,211,238,0.06)' }}
          >
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Numéro de rendez-vous
            </p>
            <p
              className="font-mono text-3xl font-bold tracking-[0.15em] text-cyan-600 dark:text-cyan-400"
              style={{ textShadow: '0 0 24px rgba(34,211,238,0.3)' }}
            >
              {confirmation.numero_rdv}
            </p>
          </div>

          <p className="mb-8 text-sm text-muted-foreground">
            💬 Un rappel SMS vous sera envoyé avant votre rendez-vous.
          </p>

          <Link
            href="/evenements"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-border/60 hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Voir les événements de dépistage
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </PublicShell>
  );
}

/* ─── page ────────────────────────────────────────────────────────────────── */

export default function RendezVousPage() {
  const [step, setStep] = useState<Step>('date');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [confirmation, setConfirmation] =
    useState<RendezVousConfirmation | null>(null);

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
    mutate: bookAppointment,
    isPending,
    error: bookError,
  } = useBookAppointment({
    onSuccess: (data: RendezVousConfirmation) => setConfirmation(data),
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

  function handleSubmit(values: ReservationInput) {
    bookAppointment(values);
  }

  if (confirmation) {
    return <ConfirmationPage confirmation={confirmation} />;
  }

  const canContinue =
    (step === 'date' && !!selectedDate) ||
    (step === 'slot' && !!selectedSlot) ||
    step === 'info';

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
                {(bookError as { response?: { data?: { detail?: string } } })
                  ?.response?.data?.detail ??
                  "Une erreur s'est produite. Vérifiez vos informations et réessayez."}
              </div>
            )}

            {/* navigation */}
            <div className="mt-6 flex items-center justify-between gap-4">
              {/* left */}
              {step === 'date' ? (
                <Link
                  href="/evenements"
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
