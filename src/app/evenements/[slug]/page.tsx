'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  MapPin,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { use, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form/form';
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

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(t: string) {
  return t.slice(0, 5);
}

function statutBadge(s: string) {
  if (s === 'en_cours')
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500 px-3 py-1 text-sm font-semibold text-white">
        <span className="size-2 animate-pulse rounded-full bg-white" />
        En cours
      </span>
    );
  if (s === 'planifie')
    return (
      <span className="rounded-full bg-blue-500 px-3 py-1 text-sm font-semibold text-white">
        À venir
      </span>
    );
  if (s === 'termine')
    return (
      <span className="rounded-full bg-slate-400 px-3 py-1 text-sm font-semibold text-white">
        Terminé
      </span>
    );
  return (
    <span className="rounded-full bg-red-500 px-3 py-1 text-sm font-semibold text-white">
      Annulé
    </span>
  );
}

function ConfirmationCard({
  confirmation,
}: {
  confirmation: InscriptionConfirmation;
}) {
  return (
    <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-8 text-center">
      <CheckCircle2 className="mx-auto mb-4 size-16 text-emerald-500" />
      <h3 className="mb-2 text-2xl font-bold text-slate-900">
        Inscription confirmée !
      </h3>
      <p className="mb-6 text-slate-600">
        Bonjour{' '}
        <strong>
          {confirmation.prenom} {confirmation.nom}
        </strong>
        , votre inscription a bien été enregistrée.
      </p>
      <div className="mx-auto max-w-xs rounded-xl bg-white p-4 shadow-sm">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">
          Numéro d&apos;inscription
        </p>
        <p className="text-2xl font-bold tracking-widest text-blue-700">
          {confirmation.numero_inscription}
        </p>
      </div>
      <p className="mt-4 text-sm text-slate-500">
        Conservez ce numéro pour le check-in le jour de l&apos;événement.
      </p>
      <Link
        href="/evenements"
        className="mt-6 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
      >
        <ArrowLeft className="size-4" />
        Voir d&apos;autres événements
      </Link>
    </div>
  );
}

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { data: event, isLoading, isError } = usePublicEvent(slug);
  const [confirmation, setConfirmation] =
    useState<InscriptionConfirmation | null>(null);

  const form = useForm<InscriptionPubliqueInput>({
    resolver: zodResolver(InscriptionPubliqueInputSchema),
    defaultValues: {
      nom: '',
      prenom: '',
      phone_number: '',
      sex: null,
      date_de_naissance: null,
    },
  });

  const {
    mutate: register,
    isPending,
    error: regError,
  } = useRegisterEvent(slug, {
    onSuccess: (data) => setConfirmation(data),
  });

  const canRegister =
    event &&
    event.statut !== 'annule' &&
    event.statut !== 'termine' &&
    event.places_restantes !== 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <Skeleton className="mb-6 h-8 w-32" />
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !event) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="mb-4 text-lg font-semibold text-slate-700">
            Événement introuvable
          </p>
          <Link href="/evenements" className="text-blue-600 hover:underline">
            ← Retour aux événements
          </Link>
        </div>
      </div>
    );
  }

  const pct = event.capacite_max
    ? Math.round(
        ((event.capacite_max - (event.places_restantes ?? 0)) /
          event.capacite_max) *
          100,
      )
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <div className="flex items-center gap-2 text-slate-900">
            <div className="flex size-7 items-center justify-center rounded-lg bg-blue-600">
              <Eye className="size-3.5 text-white" />
            </div>
            <span className="font-bold">GUISS Ophtalmologie</span>
          </div>
          <Link
            href="/evenements"
            className="flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-900"
          >
            <ArrowLeft className="size-4" />
            Tous les événements
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
          {/* Left — event info */}
          <div>
            <div className="mb-4 flex flex-wrap gap-2">
              {statutBadge(event.statut)}
              {event.pour_conducteurs && (
                <span className="rounded-full bg-indigo-100 px-3 py-1 text-sm font-medium text-indigo-700">
                  Conducteurs
                </span>
              )}
            </div>

            <h1 className="mb-6 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              {event.titre}
            </h1>

            <div className="mb-8 space-y-3 rounded-2xl bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 text-slate-700">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <Calendar className="size-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Date
                  </p>
                  <p className="font-semibold capitalize">
                    {formatDate(event.date_event)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <Clock className="size-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Horaires
                  </p>
                  <p className="font-semibold">
                    {formatTime(event.heure_debut)} –{' '}
                    {formatTime(event.heure_fin)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                  <MapPin className="size-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Lieu
                  </p>
                  <p className="font-semibold">{event.lieu}</p>
                </div>
              </div>
              {event.capacite_max && (
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                    <Users className="size-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                      Capacité
                    </p>
                    <p className="mb-1 font-semibold">
                      {event.places_restantes} places restantes sur{' '}
                      {event.capacite_max}
                    </p>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className={cn(
                          'h-2 rounded-full transition-all',
                          pct >= 90
                            ? 'bg-red-500'
                            : pct >= 60
                              ? 'bg-amber-500'
                              : 'bg-emerald-500',
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {event.description && (
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="mb-3 text-lg font-bold text-slate-900">
                  À propos
                </h2>
                <p className="leading-relaxed text-slate-600">
                  {event.description}
                </p>
              </div>
            )}
          </div>

          {/* Right — registration form */}
          <div className="self-start lg:sticky lg:top-8">
            {confirmation ? (
              <ConfirmationCard confirmation={confirmation} />
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
                <h2 className="mb-1 text-xl font-bold text-slate-900">
                  {canRegister
                    ? "S'inscrire gratuitement"
                    : 'Inscription fermée'}
                </h2>
                <p className="mb-6 text-sm text-slate-500">
                  {canRegister
                    ? 'Consultation ophtalmologique gratuite — réservez votre place'
                    : event.places_restantes === 0
                      ? 'Toutes les places sont prises.'
                      : "L'inscription pour cet événement n'est plus disponible."}
                </p>

                {canRegister ? (
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit((values) => register(values))}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-2 gap-3">
                        <FormField
                          control={form.control}
                          name="prenom"
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
                          name="nom"
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
                        name="phone_number"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="+221 77 000 00 00"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sex"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sexe (optionnel)</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value ?? undefined}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="H">Homme</SelectItem>
                                <SelectItem value="F">Femme</SelectItem>
                                <SelectItem value="A">Anonyme</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="date_de_naissance"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date de naissance (optionnel)</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {regError && (
                        <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                          {(
                            regError as {
                              response?: { data?: { detail?: string } };
                            }
                          )?.response?.data?.detail ??
                            "Une erreur s'est produite. Vérifiez vos informations."}
                        </p>
                      )}

                      <Button
                        type="submit"
                        className="h-11 w-full text-base"
                        disabled={isPending}
                      >
                        {isPending
                          ? 'Inscription en cours...'
                          : "Confirmer l'inscription"}
                      </Button>

                      <p className="text-center text-xs text-slate-400">
                        Gratuit · Sans compte requis
                      </p>
                    </form>
                  </Form>
                ) : (
                  <Link
                    href="/evenements"
                    className="flex items-center justify-center gap-2 rounded-lg bg-slate-100 px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-200"
                  >
                    <ArrowLeft className="size-4" />
                    Voir d&apos;autres événements
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
