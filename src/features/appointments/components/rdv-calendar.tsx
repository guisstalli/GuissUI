'use client';

import { format, getDay, parse, startOfWeek } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  Calendar,
  dateFnsLocalizer,
  type Event,
  type View,
} from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import type { RendezVous } from '../types/schemas';
import { STATUT_COLORS } from '../utils/statut-colors';

export interface RdvEvent extends Event {
  rdv: RendezVous;
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { locale: fr }),
  getDay,
  locales: { fr },
});

function eventStyleGetter(event: RdvEvent) {
  const color = STATUT_COLORS[event.rdv.statut] ?? '#94a3b8';
  return {
    style: {
      backgroundColor: `${color}20`,
      borderLeft: `3px solid ${color}`,
      color: color,
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '600',
      padding: '2px 6px',
    },
  };
}

function CustomToolbar({
  date,
  view,
  onNavigate,
  onView,
}: {
  date: Date;
  view: View;
  onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void;
  onView: (view: View) => void;
}) {
  const label = format(
    date,
    view === 'day' ? 'EEEE d MMMM yyyy' : "'Semaine du' d MMMM yyyy",
    { locale: fr },
  );

  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('PREV')}
          className="size-8 p-0"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('TODAY')}
          className="px-3"
        >
          Aujourd&apos;hui
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('NEXT')}
          className="size-8 p-0"
        >
          <ChevronRight className="size-4" />
        </Button>
        <h2 className="ml-2 text-base font-semibold capitalize text-foreground">
          {label}
        </h2>
      </div>
      <div className="flex gap-1 rounded-lg bg-muted p-1">
        {(['week', 'day', 'agenda'] as View[]).map((v) => (
          <button
            type="button"
            key={v}
            onClick={() => onView(v)}
            className={cn(
              'rounded-md px-3 py-1 text-sm font-medium transition-colors',
              view === v
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {v === 'week' ? 'Semaine' : v === 'day' ? 'Jour' : 'Agenda'}
          </button>
        ))}
      </div>
    </div>
  );
}

interface RdvCalendarProps {
  events: RdvEvent[];
  view: View;
  date: Date;
  onNavigate: (date: Date) => void;
  onView: (view: View) => void;
  onSelectEvent: (event: RdvEvent) => void;
}

/**
 * Vue calendrier des rendez-vous (react-big-calendar).
 * Chargé en lazy via next/dynamic depuis la page Agenda — react-big-calendar
 * ne doit jamais être importé statiquement dans une page.
 */
export function RdvCalendar({
  events,
  view,
  date,
  onNavigate,
  onView,
  onSelectEvent,
}: RdvCalendarProps) {
  return (
    <div className="overflow-x-auto">
      <div
        className={cn(
          'min-w-[600px] rounded-xl border border-border bg-card p-4',
          // Base react-big-calendar tweaks
          '[&_.rbc-calendar]:font-sans',
          '[&_.rbc-event]:border-0',
          '[&_.rbc-header]:py-2 [&_.rbc-header]:text-sm [&_.rbc-header]:font-medium',
          // Light mode colors
          '[&_.rbc-header]:text-slate-600',
          '[&_.rbc-off-range-bg]:bg-slate-50/50',
          '[&_.rbc-time-slot]:border-slate-100',
          '[&_.rbc-timeslot-group]:border-slate-100',
          '[&_.rbc-today]:bg-blue-50/40',
          '[&_.rbc-time-view]:border-slate-200',
          '[&_.rbc-time-content]:border-slate-200',
          '[&_.rbc-time-header]:border-slate-200',
          '[&_.rbc-time-header-content]:border-slate-200',
          '[&_.rbc-day-slot_.rbc-time-slot]:border-slate-100',
          '[&_.rbc-time-gutter]:text-slate-500',
          '[&_.rbc-label]:text-slate-500',
          // Dark mode overrides
          'dark:[&_.rbc-header]:text-slate-300',
          'dark:[&_.rbc-header]:border-white/10',
          'dark:[&_.rbc-off-range-bg]:bg-white/[0.02]',
          'dark:[&_.rbc-time-slot]:border-white/[0.06]',
          'dark:[&_.rbc-timeslot-group]:border-white/[0.08]',
          'dark:[&_.rbc-today]:bg-blue-500/10',
          'dark:[&_.rbc-time-view]:border-white/10',
          'dark:[&_.rbc-time-content]:border-white/10',
          'dark:[&_.rbc-time-header]:border-white/10',
          'dark:[&_.rbc-time-header-content]:border-white/10',
          'dark:[&_.rbc-day-slot_.rbc-time-slot]:border-white/[0.06]',
          'dark:[&_.rbc-time-gutter]:text-slate-400',
          'dark:[&_.rbc-label]:text-slate-400',
          'dark:[&_.rbc-day-bg]:border-white/[0.06]',
          'dark:[&_.rbc-month-view]:border-white/10',
          'dark:[&_.rbc-month-row]:border-white/[0.06]',
          'dark:[&_.rbc-date-cell]:text-slate-300',
          'dark:[&_.rbc-off-range]:text-slate-600',
          'dark:[&_.rbc-agenda-view_table]:text-slate-300',
          'dark:[&_.rbc-agenda-view_table.rbc-agenda-table_thead_>_tr_>_th]:border-white/10',
          'dark:[&_.rbc-agenda-view_table.rbc-agenda-table_tbody_>_tr_>_td]:border-white/[0.06]',
        )}
      >
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 620 }}
          view={view}
          date={date}
          onNavigate={onNavigate}
          onView={onView}
          onSelectEvent={onSelectEvent}
          eventPropGetter={eventStyleGetter}
          culture="fr"
          messages={{
            today: "Aujourd'hui",
            previous: 'Précédent',
            next: 'Suivant',
            month: 'Mois',
            week: 'Semaine',
            day: 'Jour',
            agenda: 'Agenda',
            date: 'Date',
            time: 'Heure',
            event: 'Événement',
            noEventsInRange: 'Aucun rendez-vous cette période.',
          }}
          components={{
            toolbar: (props) => (
              <CustomToolbar
                date={props.date}
                view={props.view}
                onNavigate={
                  props.onNavigate as (
                    action: 'PREV' | 'NEXT' | 'TODAY',
                  ) => void
                }
                onView={props.onView}
              />
            ),
          }}
        />
      </div>
    </div>
  );
}
