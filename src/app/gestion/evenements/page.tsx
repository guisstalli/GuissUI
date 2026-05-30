'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  MapPin,
  MoreHorizontal,
  Play,
  Plus,
  Trash2,
  Users,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { AppShell as Shell } from '@/app/_shell';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown/dropdown';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form/form';
import { Switch } from '@/components/ui/form/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useCreateEvent } from '@/features/events/api/create-event';
import {
  useCancelEvent,
  useCloseEvent,
  useDeleteEvent,
  useStartEvent,
} from '@/features/events/api/event-actions';
import { useStaffEvents } from '@/features/events/api/get-staff-events';
import {
  EventCreateInputSchema,
  type EventCreateInput,
  type EventStaff,
} from '@/features/events/types/schemas';
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

function EventActions({ event }: { event: EventStaff }) {
  const { mutate: start } = useStartEvent(event.id);
  const { mutate: close } = useCloseEvent(event.id);
  const { mutate: cancel } = useCancelEvent(event.id);
  const { mutate: del } = useDeleteEvent(event.id);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem asChild>
          <Link href={`/evenements/${event.slug}`} target="_blank">
            <ExternalLink className="mr-2 size-4" />
            Page publique
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/gestion/evenements/${event.id}/inscriptions`}>
            <Users className="mr-2 size-4" />
            Inscriptions
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {event.statut === 'planifie' && (
          <DropdownMenuItem
            onClick={() => start()}
            className="text-emerald-700"
          >
            <Play className="mr-2 size-4" />
            Démarrer
          </DropdownMenuItem>
        )}
        {event.statut === 'en_cours' && (
          <DropdownMenuItem onClick={() => close()} className="text-slate-700">
            <CheckCircle className="mr-2 size-4" />
            Clôturer
          </DropdownMenuItem>
        )}
        {event.statut !== 'annule' && event.statut !== 'termine' && (
          <DropdownMenuItem onClick={() => cancel({})} className="text-red-600">
            <XCircle className="mr-2 size-4" />
            Annuler
          </DropdownMenuItem>
        )}
        {event.statut === 'planifie' && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => del()} className="text-red-600">
              <Trash2 className="mr-2 size-4" />
              Supprimer
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CreateEventDialog() {
  const [open, setOpen] = useState(false);
  const form = useForm<EventCreateInput>({
    resolver: zodResolver(EventCreateInputSchema),
    defaultValues: {
      titre: '',
      date_event: '',
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
            onSubmit={form.handleSubmit((v) => create(v))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="titre"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titre</FormLabel>
                  <FormControl>
                    <Input placeholder="Dépistage Dakar 2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-3 gap-3">
              <FormField
                control={form.control}
                name="date_event"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="heure_debut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Début</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="heure_fin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fin</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="lieu"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lieu</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Centre de Santé Grand-Yoff, Dakar"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="type_examen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type d&apos;examen</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="adulte">Adultes</SelectItem>
                        <SelectItem value="enfant">Enfants</SelectItem>
                        <SelectItem value="les_deux">
                          Adultes & Enfants
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacite_max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacité max</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="100"
                        {...field}
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value ? Number(e.target.value) : null,
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optionnel)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Informations supplémentaires..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pour_conducteurs"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div>
                    <FormLabel className="text-sm font-medium">
                      Événement pour conducteurs
                    </FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Collecte des données de permis lors de l&apos;inscription
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? false}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
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
              <Link href="/evenements" target="_blank">
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
