'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { PublicShell } from '@/components/public/public-shell';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form/form';
import { PhoneInput } from '@/components/ui/form/phone-input';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicEvent } from '@/features/events/api/get-public-event';
import { useRegisterEvent } from '@/features/events/api/register-event';
import type {
  InscriptionConfirmation,
  InscriptionPubliqueInput,
} from '@/features/events/types/schemas';
import { InscriptionPubliqueInputSchema } from '@/features/events/types/schemas';
import { cn } from '@/lib/utils';

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(t: string) {
  return t.slice(0, 5);
}

const STATUS_MAP = {
  en_cours: {
    label: 'En cours',
    cls: 'bg-emerald-400/[0.12] border border-emerald-400/30 text-emerald-600',
    dot: true,
  },
  planifie: {
    label: 'À venir',
    cls: 'bg-sky-400/[0.10] border border-sky-400/25 text-sky-400',
    dot: false,
  },
  termine: {
    label: 'Terminé',
    cls: 'bg-slate-400/[0.08] border border-slate-400/20 text-slate-500',
    dot: false,
  },
  annule: {
    label: 'Annulé',
    cls: 'bg-red-400/[0.10] border border-red-400/20 text-red-400',
    dot: false,
  },
} as const;

const TYPE_LABELS: Record<string, string> = {
  adulte: 'Adultes',
  enfant: 'Enfants',
  les_deux: 'Tous publics',
};

/* ─── confirmation card ───────────────────────────────────────────────────── */

function ConfirmationCard({
  confirmation,
  titre,
}: {
  confirmation: InscriptionConfirmation;
  titre: string;
}) {
  return (
    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.05] p-8 text-center">
      {/* animated checkmark */}
      <div
        className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full border border-emerald-400/25 bg-emerald-400/[0.12]"
        style={{ animation: 'popIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both' }}
      >
        <CheckCircle2 className="size-10 text-emerald-600" />
      </div>
      <h3 className="mb-2 text-2xl font-bold text-slate-900">
        Inscription confirmée !
      </h3>
      <p className="mb-6 text-slate-600">
        Bonjour{' '}
        <span className="font-semibold text-slate-900">
          {confirmation.prenom} {confirmation.nom}
        </span>
        , votre inscription pour <span className="text-slate-900">{titre}</span>{' '}
        a bien été enregistrée.
      </p>

      {/* inscription number */}
      <div className="mx-auto mb-6 max-w-xs rounded-xl border border-slate-200 bg-white p-5">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Numéro d&apos;inscription
        </p>
        <p
          className="font-mono text-3xl font-bold tracking-[0.18em] text-cyan-600"
          style={{ textShadow: '0 0 20px rgba(34,211,238,0.4)' }}
        >
          {confirmation.numero_inscription}
        </p>
      </div>

      <p className="mb-6 text-sm text-slate-500">
        Conservez ce numéro pour le check-in le jour de l&apos;événement.
      </p>

      <Link
        href="/public/evenements"
        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-600 transition-all hover:border-slate-200 hover:text-slate-900"
      >
        <ArrowLeft className="size-4" />
        Voir d&apos;autres événements
      </Link>

      <style>{`
        @keyframes popIn {
          from { transform: scale(0); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* ─── loading skeleton ────────────────────────────────────────────────────── */

function PageSkeleton() {
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
      <div className="space-y-5">
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full bg-white" />
          <Skeleton className="h-6 w-24 rounded-full bg-white" />
        </div>
        <Skeleton className="h-10 w-3/4 rounded bg-white" />
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-5 w-full rounded bg-white" />
          ))}
        </div>
      </div>
      <Skeleton className="h-96 rounded-2xl bg-white" />
    </div>
  );
}

/* ─── registration form ───────────────────────────────────────────────────── */

function RegistrationForm({
  slug,
  canRegister,
  onSuccess,
}: {
  slug: string;
  canRegister: boolean;
  onSuccess: (data: InscriptionConfirmation) => void;
}) {
  const form = useForm<InscriptionPubliqueInput>({
    resolver: zodResolver(InscriptionPubliqueInputSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      phone_number: '',
      sex: undefined,
      date_de_naissance: '',
    },
  });

  const {
    mutate: register,
    isPending,
    error: regError,
  } = useRegisterEvent(slug, {
    onSuccess,
  });

  function onSubmit(values: InscriptionPubliqueInput) {
    register(values);
  }

  if (!canRegister) {
    return (
      <div className="text-center">
        <p className="mb-4 text-sm text-slate-600">
          L&apos;inscription pour cet événement n&apos;est plus disponible.
        </p>
        <Link
          href="/public/evenements"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-all hover:text-slate-900"
        >
          <ArrowLeft className="size-4" />
          Voir les autres événements
        </Link>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="prenom"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-slate-600">
                  Prénom *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Fatou"
                    {...field}
                    className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-600 focus:border-cyan-400/40"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-400" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-slate-600">
                  Nom *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Diallo"
                    {...field}
                    className="border-slate-200 bg-white text-slate-900 placeholder:text-slate-600 focus:border-cyan-400/40"
                  />
                </FormControl>
                <FormMessage className="text-xs text-red-400" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-slate-600">
                Téléphone
              </FormLabel>
              <FormControl>
                <PhoneInput
                  placeholder="77 000 00 00"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                  numberInputProps={{
                    className:
                      'flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-900 placeholder:text-slate-600 focus:border-cyan-400/40 focus-visible:outline-none',
                  }}
                />
              </FormControl>
              <FormMessage className="text-xs text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="sex"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-slate-600">
                Genre *
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value ?? undefined}
              >
                <FormControl>
                  <SelectTrigger className="border-slate-200 bg-white text-slate-700 focus:border-cyan-400/40">
                    <SelectValue placeholder="Choisir…" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="H">Homme</SelectItem>
                  <SelectItem value="F">Femme</SelectItem>
                  <SelectItem value="A">Anonyme</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage className="text-xs text-red-400" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date_de_naissance"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-slate-600">
                Date de naissance *
              </FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                  value={field.value ?? ''}
                  className="border-slate-200 bg-white text-slate-700 focus:border-cyan-400/40"
                />
              </FormControl>
              <FormMessage className="text-xs text-red-400" />
            </FormItem>
          )}
        />

        {regError && (
          <div className="rounded-xl border border-red-400/20 bg-red-400/[0.06] p-3 text-sm text-red-400">
            {(regError as { response?: { data?: { detail?: string } } })
              ?.response?.data?.detail ??
              'Une erreur est survenue. Vérifiez vos informations.'}
          </div>
        )}

        <Button
          type="submit"
          disabled={isPending}
          className="h-11 w-full bg-cyan-400 text-sm font-bold text-slate-900 hover:bg-cyan-300 hover:shadow-[0_0_20px_rgba(34,211,238,0.4)]"
        >
          {isPending ? 'Inscription en cours…' : "Confirmer l'inscription"}
        </Button>

        <p className="text-center text-xs text-slate-600">
          Gratuit · Sans compte requis · Vos données restent confidentielles
        </p>
      </form>
    </Form>
  );
}

/* ─── page ────────────────────────────────────────────────────────────────── */

export default function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [confirmation, setConfirmation] =
    useState<InscriptionConfirmation | null>(null);

  const { data: event, isLoading, isError } = usePublicEvent(slug);

  const canRegister =
    !!event &&
    event.statut !== 'annule' &&
    event.statut !== 'termine' &&
    event.places_restantes !== 0;

  const pct =
    event?.capacite_max && event.places_restantes != null
      ? Math.round(
          ((event.capacite_max - event.places_restantes) / event.capacite_max) *
            100,
        )
      : 0;

  return (
    <PublicShell>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        {/* back link */}
        <div className="mb-8">
          <Link
            href="/public/evenements"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-800"
          >
            <ArrowLeft className="size-4" />
            Tous les événements
          </Link>
        </div>

        {isLoading ? (
          <PageSkeleton />
        ) : isError || !event ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="mb-2 text-lg font-semibold text-slate-700">
              Événement introuvable
            </p>
            <p className="mb-6 text-sm text-slate-500">
              Cet événement n&apos;existe pas ou n&apos;est plus disponible.
            </p>
            <Link
              href="/public/evenements"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="size-4" />
              Retour aux événements
            </Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
            {/* ── left col: event info ── */}
            <div>
              {/* badges */}
              <div className="mb-5 flex flex-wrap gap-2">
                {(() => {
                  const s =
                    STATUS_MAP[event.statut as keyof typeof STATUS_MAP] ??
                    STATUS_MAP.planifie;
                  return (
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold',
                        s.cls,
                      )}
                    >
                      {s.dot && (
                        <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                      )}
                      {s.label}
                    </span>
                  );
                })()}
                {event.pour_conducteurs && (
                  <span className="rounded-full border border-indigo-400/20 bg-indigo-400/[0.10] px-3 py-1 text-sm font-medium text-indigo-400">
                    Conducteurs
                  </span>
                )}
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600">
                  {TYPE_LABELS[event.type_examen] ?? event.type_examen}
                </span>
              </div>

              {/* title */}
              <h1 className="mb-8 text-3xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-4xl">
                {event.titre}
              </h1>

              {/* info card */}
              <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 backdrop-blur-sm">
                <div className="space-y-4">
                  {[
                    {
                      icon: Calendar,
                      label: 'Date',
                      value: (
                        <span className="capitalize">
                          {formatDate(event.date_event)}
                        </span>
                      ),
                    },
                    {
                      icon: Clock,
                      label: 'Horaires',
                      value: `${formatTime(event.heure_debut)} – ${formatTime(event.heure_fin)}`,
                    },
                    {
                      icon: MapPin,
                      label: 'Lieu',
                      value: event.lieu,
                    },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/15 bg-cyan-400/[0.08]">
                        <Icon className="size-4 text-cyan-600" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                          {label}
                        </p>
                        <p className="font-medium text-slate-800">{value}</p>
                      </div>
                    </div>
                  ))}

                  {/* capacity */}
                  {event.capacite_max != null && (
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-cyan-400/15 bg-cyan-400/[0.08]">
                        <Users className="size-4 text-cyan-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-600">
                          Capacité
                        </p>
                        <p className="mb-2 font-medium text-slate-800">
                          {event.places_restantes} places restantes sur{' '}
                          {event.capacite_max}
                        </p>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-white">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              pct >= 90
                                ? 'bg-gradient-to-r from-red-500 to-red-400'
                                : pct >= 60
                                  ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                                  : 'bg-gradient-to-r from-cyan-500 to-blue-500',
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* description */}
              {event.description && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 backdrop-blur-sm">
                  <h2 className="mb-3 text-base font-bold text-slate-900">
                    À propos
                  </h2>
                  <p className="text-sm leading-relaxed text-slate-600">
                    {event.description}
                  </p>
                </div>
              )}
            </div>

            {/* ── right col: form (sticky) ── */}
            <div className="self-start lg:sticky lg:top-24">
              <div className="rounded-2xl border border-slate-200 bg-white p-7 backdrop-blur-sm">
                <h2 className="mb-1 text-xl font-bold text-slate-900">
                  {confirmation
                    ? 'Inscription confirmée'
                    : canRegister
                      ? "S'inscrire gratuitement"
                      : 'Inscription fermée'}
                </h2>
                {!confirmation && (
                  <p className="mb-6 text-sm text-slate-600">
                    {canRegister
                      ? 'Consultation ophtalmologique gratuite — réservez votre place.'
                      : event.places_restantes === 0
                        ? 'Toutes les places ont été prises.'
                        : "Cet événement n'accepte plus d'inscriptions."}
                  </p>
                )}

                {confirmation ? (
                  <ConfirmationCard
                    confirmation={confirmation}
                    titre={event.titre}
                  />
                ) : (
                  <RegistrationForm
                    slug={slug}
                    canRegister={canRegister}
                    onSuccess={setConfirmation}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PublicShell>
  );
}
