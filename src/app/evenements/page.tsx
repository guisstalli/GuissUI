'use client';

import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Eye,
  ChevronRight,
  Search,
  Filter,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicEvents } from '@/features/events/api/get-public-events';
import type { EventPublic } from '@/features/events/types/schemas';
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

function statutLabel(s: string) {
  if (s === 'en_cours') return { label: 'En cours', color: 'bg-emerald-500' };
  if (s === 'planifie') return { label: 'À venir', color: 'bg-blue-500' };
  if (s === 'termine') return { label: 'Terminé', color: 'bg-slate-400' };
  return { label: 'Annulé', color: 'bg-red-500' };
}

function typeLabel(t: string) {
  if (t === 'adulte') return 'Adultes';
  if (t === 'enfant') return 'Enfants';
  return 'Adultes & Enfants';
}

function CapacityBar({
  max,
  restants,
}: {
  max: number | null;
  restants: number | null;
}) {
  if (max === null || restants === null) return null;
  const pct = Math.round(((max - restants) / max) * 100);
  const inscrits = max - restants;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{inscrits} inscrits</span>
        <span>{restants} places restantes</span>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}

function EventCard({ event }: { event: EventPublic }) {
  const statut = statutLabel(event.statut);
  const isFull = event.places_restantes === 0;
  const isEnCours = event.statut === 'en_cours';

  return (
    <Link
      href={`/evenements/${event.slug}`}
      className="group block rounded-2xl border border-border bg-card p-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap gap-2">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold text-white',
                statut.color,
              )}
            >
              {isEnCours && (
                <span className="size-1.5 animate-pulse rounded-full bg-white" />
              )}
              {statut.label}
            </span>
            <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {typeLabel(event.type_examen)}
            </span>
            {event.pour_conducteurs && (
              <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700">
                Conducteurs
              </span>
            )}
          </div>
          <h3 className="line-clamp-2 text-lg font-bold text-foreground transition-colors group-hover:text-blue-700">
            {event.titre}
          </h3>
        </div>
        <ChevronRight className="text-muted-foreground/60 mt-1 size-5 shrink-0 transition-transform group-hover:translate-x-1 group-hover:text-blue-500" />
      </div>

      {/* Meta */}
      <div className="mb-4 space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Calendar className="size-4 shrink-0 text-blue-500" />
          <span className="capitalize">{formatDate(event.date_event)}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-4 shrink-0 text-blue-500" />
          <span>
            {formatTime(event.heure_debut)} – {formatTime(event.heure_fin)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="size-4 shrink-0 text-blue-500" />
          <span className="line-clamp-1">{event.lieu}</span>
        </div>
      </div>

      {/* Capacity */}
      {event.capacite_max && (
        <div className="mb-4">
          <CapacityBar
            max={event.capacite_max}
            restants={event.places_restantes}
          />
        </div>
      )}

      {/* CTA */}
      <div className="mt-auto">
        {isFull ? (
          <p className="text-center text-sm font-semibold text-red-600">
            Complet — plus de places disponibles
          </p>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {event.capacite_max === null
                ? 'Places illimitées'
                : `${event.places_restantes} places`}
            </span>
            <span className="rounded-lg bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition-colors group-hover:bg-blue-700">
              S&apos;inscrire →
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

function EventCardSkeleton() {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-1.5 w-full rounded-full" />
    </div>
  );
}

export default function EvenementsPublicPage() {
  const [includePast, setIncludePast] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = usePublicEvents({
    include_past: includePast,
    type_examen: typeFilter !== 'all' ? typeFilter : undefined,
    limit: 50,
  });

  const events = data?.results ?? [];

  const filtered = search.trim()
    ? events.filter(
        (e) =>
          e.titre.toLowerCase().includes(search.toLowerCase()) ||
          e.lieu.toLowerCase().includes(search.toLowerCase()),
      )
    : events;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
          {/* Nav */}
          <div className="mb-12 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <div className="flex size-8 items-center justify-center rounded-lg bg-white/20">
                <Eye className="size-4" />
              </div>
              <span className="text-lg font-bold">GUISS Ophtalmologie</span>
            </div>
            <Link
              href="/auth/login"
              className="rounded-lg border border-white/30 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-white/20"
            >
              Espace staff
            </Link>
          </div>

          {/* Hero content */}
          <div className="text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur">
              <span className="size-2 animate-pulse rounded-full bg-emerald-400" />
              Dépistages ophtalmologiques gratuits
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Événements de
              <br />
              <span className="text-sky-300">dépistage visuel</span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-white/75">
              Consultations ophtalmologiques gratuites organisées par
              l&apos;Université Iba Der Thiam. Inscrivez-vous à l&apos;événement
              le plus proche de chez vous.
            </p>

            {/* Search */}
            <div className="mx-auto flex max-w-lg gap-2">
              <div className="relative flex-1">
                <Search className="text-muted-foreground/60 absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  placeholder="Rechercher un événement ou un lieu..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-11 w-full rounded-xl border-0 bg-card pl-9 text-foreground"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="relative">
          <svg
            viewBox="0 0 1440 60"
            className="w-full fill-background"
            preserveAspectRatio="none"
          >
            <path d="M0,60 C360,0 1080,60 1440,20 L1440,60 Z" />
          </svg>
        </div>
      </div>

      {/* Content */}
      <div className="bg-background pb-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3 py-6">
            <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Filter className="size-4" />
              Filtrer :
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-9 w-44 rounded-lg border-border bg-card">
                <SelectValue placeholder="Type d'examen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les types</SelectItem>
                <SelectItem value="adulte">Adultes</SelectItem>
                <SelectItem value="enfant">Enfants</SelectItem>
                <SelectItem value="les_deux">Adultes & Enfants</SelectItem>
              </SelectContent>
            </Select>

            <button
              type="button"
              onClick={() => setIncludePast(!includePast)}
              className={cn(
                'h-9 rounded-lg border px-3.5 text-sm font-medium transition-colors',
                includePast
                  ? 'border-blue-300 bg-blue-50 text-blue-700'
                  : 'border-border bg-card text-slate-600 hover:bg-slate-50',
              )}
            >
              {includePast ? '✓ ' : ''}Voir passés
            </button>

            {data && (
              <span className="text-muted-foreground/60 ml-auto text-sm">
                {filtered.length} événement{filtered.length > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : isError ? (
            <div className="py-20 text-center">
              <p className="text-slate-500">
                Impossible de charger les événements. Réessayez plus tard.
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Users className="mx-auto mb-4 size-12 text-slate-300" />
              <h3 className="mb-2 text-lg font-semibold text-slate-700">
                Aucun événement disponible
              </h3>
              <p className="text-slate-500">
                {includePast
                  ? 'Aucun événement ne correspond à vos critères.'
                  : 'Aucun événement à venir pour le moment. Cliquez sur "Voir passés" pour voir l\'historique.'}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((event) => (
                <EventCard key={event.slug} event={event} />
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="text-muted-foreground/60 mt-16 border-t border-border pt-8 text-center text-sm">
            <p>
              © {new Date().getFullYear()} GUISS — Service Ophtalmologie ·
              Université Iba Der Thiam
            </p>
            <div className="mt-2 flex justify-center gap-4">
              <Link
                href="/rendez-vous"
                className="transition-colors hover:text-blue-600"
              >
                Prendre un rendez-vous
              </Link>
              <Link
                href="/auth/login"
                className="transition-colors hover:text-blue-600"
              >
                Espace professionnel
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
