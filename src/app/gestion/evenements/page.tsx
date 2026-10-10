'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Plus,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { AppShell as Shell } from '@/app/_shell';
import { EventActions } from '@/app/gestion/evenements/event-actions-menu';
import { EventFormFields } from '@/app/gestion/evenements/event-form-fields';
import { Badge } from '@/components/ui/badge/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog/dialog';
import { Form } from '@/components/ui/form/form';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreateEvent } from '@/features/events/api/create-event';
import { useStaffEvents } from '@/features/events/api/get-staff-events';
import {
  EventCreateInputSchema,
  type EventCreateInput,
  type EventStaff,
} from '@/features/events/types/schemas';
import { estSurPlusieursJours } from '@/features/events/utils/format-periode';
import { cn } from '@/lib/utils';

function statutBadge(s: string) {
  switch (s) {
    case 'planifie':
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
          Planifié
        </Badge>
      );
    case 'en_cours':
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          En cours
        </Badge>
      );
    case 'termine':
      return (
        <Badge className="bg-muted text-muted-foreground hover:bg-muted">
          Terminé
        </Badge>
      );
    case 'annule':
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
          Annulé
        </Badge>
      );
    default:
      return <Badge variant="secondary">{s}</Badge>;
  }
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function CreateEventDialog() {
  const [open, setOpen] = useState(false);
  const form = useForm<EventCreateInput>({
    resolver: zodResolver(EventCreateInputSchema),
    defaultValues: {
      titre: '',
      date_event: '',
      date_fin: '',
      heure_debut: '',
      heure_fin: '',
      lieu: '',
      type_examen: 'adulte',
      capacite_max: null,
      description: '',
      pour_conducteurs: false,
    },
  });
  const { mutate: create, isPending } = useCreateEvent({
    onSuccess: () => {
      setOpen(false);
      form.reset();
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="size-4" />
          Nouvel événement
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Créer un événement</DialogTitle>
          <DialogDescription>
            Créez un nouveau dépistage ophtalmologique.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) =>
              // Une chaîne vide n'est pas une date : le serializer attend une
              // date ou `null`, et `''` serait rejeté. Le champ non rempli
              // signifie « une seule journée ».
              create({ ...v, date_fin: v.date_fin || null }),
            )}
            className="space-y-4"
          >
            <EventFormFields form={form} />
            <div className="flex justify-end gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Création...' : 'Créer'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

const VALID_EVENT_STATUTS = ['planifie', 'en_cours', 'termine', 'annule'];

export default function GestionEvenementsPage() {
  const searchParams = useSearchParams();
  const initialStatut = searchParams.get('statut') ?? 'all';
  const safeInitialStatut = VALID_EVENT_STATUTS.includes(initialStatut)
    ? initialStatut
    : 'all';
  const [statutFilter, setStatutFilter] = useState<string>(safeInitialStatut);
  const { data, isLoading } = useStaffEvents({
    statut: statutFilter !== 'all' ? statutFilter : undefined,
    limit: 100,
  });

  const events: EventStaff[] =
    (data as { results?: EventStaff[] })?.results ??
    (Array.isArray(data) ? (data as EventStaff[]) : []);

  const TABS = [
    { value: 'all', label: 'Tous' },
    { value: 'planifie', label: 'Planifiés' },
    { value: 'en_cours', label: 'En cours' },
    { value: 'termine', label: 'Terminés' },
    { value: 'annule', label: 'Annulés' },
  ];

  return (
    <Shell title="Événements">
      <div className="flex flex-1 flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Événements</h1>
            <p className="text-sm text-muted-foreground">
              Gérez les dépistages ophtalmologiques
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <Link href="/public/evenements" target="_blank">
                <ExternalLink className="mr-2 size-4" />
                Page publique
              </Link>
            </Button>
            <CreateEventDialog />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-muted p-1">
          {TABS.map((tab) => (
            <button
              type="button"
              key={tab.value}
              onClick={() => setStatutFilter(tab.value)}
              className={cn(
                'shrink-0 flex-1 rounded-lg px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
                statutFilter === tab.value
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Events list */}
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border py-16 text-center">
            <Calendar className="text-muted-foreground/40 mx-auto mb-3 size-10" />
            <p className="font-semibold text-muted-foreground">
              Aucun événement
            </p>
            <p className="text-muted-foreground/70 mt-1 text-sm">
              Créez votre premier événement de dépistage.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {events.map((event) => (
              <div
                key={event.slug}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-sm"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    {statutBadge(event.statut)}
                    {event.pour_conducteurs && (
                      <span className="bg-primary/10 rounded-full px-2 py-0.5 text-xs font-medium text-primary">
                        Conducteurs
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/gestion/evenements/${event.id}/inscriptions`}
                    className="truncate font-semibold text-foreground hover:text-primary hover:underline"
                  >
                    {event.titre}
                  </Link>
                  <div className="mt-1 flex flex-wrap gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      {formatDate(event.date_event)}
                      {estSurPlusieursJours(
                        event.date_event,
                        event.date_fin,
                      ) && <> → {formatDate(event.date_fin!)}</>}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-3.5" />
                      {event.heure_debut.slice(0, 5)} –{' '}
                      {event.heure_fin.slice(0, 5)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="size-3.5" />
                      {event.lieu}
                    </span>
                    {event.capacite_max && (
                      <span className="flex items-center gap-1">
                        <Users className="size-3.5" />
                        {event.places_restantes ?? '?'} / {event.capacite_max}{' '}
                        places
                      </span>
                    )}
                  </div>
                </div>
                <EventActions event={event} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Shell>
  );
}
