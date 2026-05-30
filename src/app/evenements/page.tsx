'use client';

import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Clock,
  MapPin,
  Search,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { PublicShell } from '@/components/public/public-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { usePublicEvents } from '@/features/events/api/get-public-events';
import type { EventPublic } from '@/features/events/types/schemas';
import { cn } from '@/lib/utils';

/* ─── helpers ─────────────────────────────────────────────────────────────── */

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatTime(t: string) {
  return t.slice(0, 5);
}

const STATUS_MAP = {
  en_cours: {
    label: 'En cours',
    dot: true,
    cls: 'bg-emerald-400/[0.12] border border-emerald-400/30 text-emerald-400',
  },
  planifie: {
    label: 'À venir',
    dot: false,
    cls: 'bg-sky-400/[0.10] border border-sky-400/25 text-sky-400',
  },
  termine: {
    label: 'Terminé',
    dot: false,
    cls: 'bg-slate-400/[0.08] border border-slate-400/20 text-slate-500',
  },
  annule: {
    label: 'Annulé',
    dot: false,
    cls: 'bg-red-400/[0.10] border border-red-400/20 text-red-400',
  },
} as const;

const TYPE_LABELS: Record<string, string> = {
  adulte: 'Adultes',
  enfant: 'Enfants',
  les_deux: 'Tous publics',
};

type TypeFilter = 'all' | 'adulte' | 'enfant' | 'les_deux';

/* ─── corner ornament ─────────────────────────────────────────────────────── */

function CornerOrnament({ className }: { className?: string }) {
  return (
    <div
      className={cn('pointer-events-none absolute size-12', className)}
      aria-hidden
    >
      <div className="absolute left-0 top-0 h-px w-8 bg-white/[0.18]" />
      <div className="absolute left-0 top-0 h-8 w-px bg-white/[0.18]" />
      <span
        className="absolute left-1.5 top-1.5 size-1.5 rounded-full bg-cyan-400/70"
        style={{ boxShadow: '0 0 8px rgba(34,211,238,0.7)' }}
      />
    </div>
  );
}

/* ─── filter pill ─────────────────────────────────────────────────────────── */

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200',
        active
          ? 'border-cyan-400/50 bg-cyan-400/[0.12] text-cyan-400'
          : 'border-white/[0.10] text-slate-400 hover:border-white/[0.20] hover:text-slate-200',
      )}
    >
      {children}
    </button>
  );
}

/* ─── event card ──────────────────────────────────────────────────────────── */

function EventCard({ event }: { event: EventPublic }) {
  const status =
    STATUS_MAP[event.statut as keyof typeof STATUS_MAP] ?? STATUS_MAP.planifie;
  const pct =
    event.capacite_max && event.places_restantes != null
      ? Math.round(
          ((event.capacite_max - event.places_restantes) / event.capacite_max) *
            100,
        )
      : 0;
  const isFull = event.places_restantes === 0;

  return (
    <Link
      href={`/evenements/${event.slug}`}
      className="group flex flex-col rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 backdrop-blur-sm transition-all duration-200 hover:border-white/[0.18] hover:bg-white/[0.07] hover:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_0_1px_rgba(34,211,238,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50"
    >
      {/* badges */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold',
            status.cls,
          )}
        >
          {status.dot && (
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
          )}
          {status.label}
        </span>
        <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs font-medium text-slate-400">
          {TYPE_LABELS[event.type_examen] ?? event.type_examen}
        </span>
        {event.pour_conducteurs && (
          <span className="rounded-full border border-indigo-400/20 bg-indigo-400/[0.10] px-2.5 py-0.5 text-xs font-medium text-indigo-400">
            Conducteurs
          </span>
        )}
      </div>

      {/* title */}
      <div className="mb-5 flex items-start justify-between gap-3">
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-100 transition-colors group-hover:text-white">
          {event.titre}
        </h3>
        <ChevronRight className="mt-0.5 size-4 shrink-0 text-slate-600 transition-all group-hover:translate-x-0.5 group-hover:text-cyan-400" />
      </div>

      {/* meta */}
      <div className="mb-5 space-y-2.5 text-sm text-slate-400">
        <div className="flex items-center gap-2.5">
          <Calendar className="size-3.5 shrink-0 text-cyan-400/70" />
          <span className="capitalize">{formatDate(event.date_event)}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Clock className="size-3.5 shrink-0 text-cyan-400/70" />
          <span>
            {formatTime(event.heure_debut)} – {formatTime(event.heure_fin)}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <MapPin className="size-3.5 shrink-0 text-cyan-400/70" />
          <span className="line-clamp-1">{event.lieu}</span>
        </div>
      </div>

      {/* capacity bar */}
      {event.capacite_max != null && (
        <div className="mb-4 space-y-1.5">
          <div className="flex justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Users className="size-3" />
              {event.capacite_max - (event.places_restantes ?? 0)} inscrits
            </span>
            <span>{event.places_restantes} places</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {/* cta */}
      <div className="mt-auto flex items-center justify-between">
        {isFull ? (
          <span className="text-sm font-semibold text-red-400">Complet</span>
        ) : (
          <>
            <span className="text-xs text-slate-500">
              {event.capacite_max == null
                ? 'Places illimitées'
                : `${event.places_restantes} restantes`}
            </span>
            <span className="rounded-lg bg-cyan-400 px-3.5 py-1.5 text-xs font-bold text-slate-900 transition-all group-hover:bg-cyan-300 group-hover:shadow-[0_0_14px_rgba(34,211,238,0.5)]">
              S&apos;inscrire →
            </span>
          </>
        )}
      </div>
    </Link>
  );
}

function EventCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
      <div className="mb-4 flex gap-2">
        <Skeleton className="h-5 w-20 rounded-full bg-white/[0.06]" />
        <Skeleton className="h-5 w-16 rounded-full bg-white/[0.06]" />
      </div>
      <Skeleton className="mb-5 h-5 w-4/5 rounded bg-white/[0.06]" />
      <div className="mb-5 space-y-2.5">
        <Skeleton className="h-4 w-3/4 rounded bg-white/[0.06]" />
        <Skeleton className="h-4 w-1/2 rounded bg-white/[0.06]" />
        <Skeleton className="h-4 w-2/3 rounded bg-white/[0.06]" />
      </div>
      <Skeleton className="h-2 w-full rounded-full bg-white/[0.06]" />
    </div>
  );
}

/* ─── page ────────────────────────────────────────────────────────────────── */

export default function EvenementsPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [includePast, setIncludePast] = useState(false);

  const {
    data: eventsData,
    isLoading,
    isError,
  } = usePublicEvents({
    include_past: true,
    limit: 100,
  });

  const allEvents = eventsData?.results ?? [];

  const filtered = allEvents.filter((e) => {
    if (!includePast && (e.statut === 'termine' || e.statut === 'annule'))
      return false;
    if (typeFilter !== 'all' && e.type_examen !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !e.titre.toLowerCase().includes(q) &&
        !e.lieu.toLowerCase().includes(q)
      )
        return false;
    }
    return true;
  });

  const activeCount = allEvents.filter(
    (e) => e.statut === 'planifie' || e.statut === 'en_cours',
  ).length;

  return (
    <PublicShell fullBleed>
      {/* ── hero ── */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 pb-16 pt-20 sm:px-6">
        {/* corner ornaments */}
        <CornerOrnament className="left-8 top-8" />
        <CornerOrnament className="right-8 top-8 -scale-x-100" />
        <CornerOrnament className="bottom-20 left-8 -scale-y-100" />
        <CornerOrnament className="bottom-20 right-8 -scale-100" />

        <div className="mx-auto max-w-3xl text-center">
          {/* badge */}
          <div
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.08] px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-cyan-400"
            style={{ animationFillMode: 'both' }}
          >
            <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
            Dépistages gratuits · UIDT · Sénégal
          </div>

          {/* h1 */}
          <h1 className="mb-6 font-black leading-[1.05] tracking-tight text-white">
            <span
              className="block"
              style={{
                fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
              }}
            >
              Examens visuels
            </span>
            <span
              className="block"
              style={{
                fontSize: 'clamp(2.8rem, 8vw, 5.5rem)',
                background:
                  'linear-gradient(135deg, #22d3ee 0%, #38bdf8 50%, #818cf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              gratuits
            </span>
          </h1>

          {/* subtitle */}
          <p className="mx-auto mb-10 max-w-xl text-lg leading-relaxed text-slate-400">
            Consultations ophtalmologiques organisées par l&apos;Université Iba
            Der Thiam. Prenez soin de votre vue — sans frais, sans rendez-vous
            obligatoire.
          </p>

          {/* search */}
          <div className="mx-auto mb-10 max-w-md">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                placeholder="Rechercher un événement ou un lieu…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-12 w-full rounded-xl border border-white/[0.10] bg-white/[0.06] pl-11 pr-4 text-sm text-slate-200 backdrop-blur-sm transition-all placeholder:text-slate-500 focus:border-cyan-400/40 focus:bg-white/[0.09] focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          {/* stats + cta */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            {activeCount > 0 && (
              <span className="text-sm text-slate-400">
                <span className="font-bold text-white">{activeCount}</span>{' '}
                événements disponibles
              </span>
            )}
            <Link
              href="/rendez-vous"
              className="rounded-lg border border-white/[0.12] px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:border-white/[0.25] hover:bg-white/[0.06] hover:text-white"
            >
              Prendre un RDV individuel
            </Link>
          </div>
        </div>

        {/* scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-slate-600">
          <ChevronDown className="size-5" />
        </div>
      </section>

      {/* ── events section ── */}
      <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        {/* filters */}
        <div className="mb-8 flex flex-wrap items-center gap-2.5 border-b border-white/[0.06] pb-6">
          <FilterPill
            active={typeFilter === 'all'}
            onClick={() => setTypeFilter('all')}
          >
            Tous
          </FilterPill>
          <FilterPill
            active={typeFilter === 'adulte'}
            onClick={() => setTypeFilter('adulte')}
          >
            Adultes
          </FilterPill>
          <FilterPill
            active={typeFilter === 'enfant'}
            onClick={() => setTypeFilter('enfant')}
          >
            Enfants
          </FilterPill>
          <FilterPill
            active={typeFilter === 'les_deux'}
            onClick={() => setTypeFilter('les_deux')}
          >
            Tous publics
          </FilterPill>
          <div className="ml-0 h-4 w-px bg-white/[0.10] sm:ml-2" />
          <FilterPill
            active={includePast}
            onClick={() => setIncludePast((v) => !v)}
          >
            {includePast ? '✓ ' : ''}Voir les passés
          </FilterPill>
          <span className="ml-auto text-xs text-slate-600">
            {filtered.length} résultat{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* grid */}
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-10 text-center">
            <p className="font-semibold text-red-400">
              Impossible de charger les événements.
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Vérifiez votre connexion et réessayez.
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-white/[0.06] bg-white/[0.02] py-20 text-center">
            <Users className="mb-4 size-12 text-slate-700" />
            <p className="font-semibold text-slate-400">
              Aucun événement trouvé
            </p>
            <p className="mt-1 text-sm text-slate-600">
              {search
                ? 'Essayez un autre terme de recherche.'
                : 'Revenez bientôt, de nouveaux événements seront annoncés.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event) => (
              <EventCard key={event.slug} event={event} />
            ))}
          </div>
        )}
      </section>
    </PublicShell>
  );
}
