import { ArrowRight, MapPin, Users } from 'lucide-react';
import Link from 'next/link';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

import type { EvenementEnCours } from '../types/schemas';

interface ActiveEventsProps {
  events: EvenementEnCours[];
}

function PresenceProgress({
  presents,
  inscrits,
}: {
  presents: number;
  inscrits: number;
}) {
  const pct = inscrits > 0 ? Math.round((presents / inscrits) * 100) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          {presents} / {inscrits} présents
        </span>
        <span>{pct}%</span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all',
            pct >= 75
              ? 'bg-emerald-500'
              : pct >= 40
                ? 'bg-amber-500'
                : 'bg-primary',
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function ActiveEvents({ events }: ActiveEventsProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Aucun événement en cours.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Link
          key={event.id}
          href={`/gestion/evenements/${event.id}/inscriptions`}
          className="group block"
        >
          <Card className="overflow-hidden transition-shadow group-hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm font-semibold leading-snug text-foreground">
                  {event.titre}
                </CardTitle>
                <ArrowRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{event.lieu}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="size-3.5 shrink-0" aria-hidden="true" />
                <span>{event.inscrits} inscrits</span>
              </div>
              <PresenceProgress
                presents={event.presents}
                inscrits={event.inscrits}
              />
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}
