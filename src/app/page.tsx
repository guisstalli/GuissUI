'use client';

import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import {
  AlertCircle,
  CalendarCheck,
  ClipboardList,
  Truck,
  Users,
} from 'lucide-react';
import Link from 'next/link';

import { AppShell as Shell } from '@/app/_shell';
import { Spinner } from '@/components/ui/spinner';
import { useDashboard } from '@/features/dashboard/api/get-dashboard';
import { ActiveEvents } from '@/features/dashboard/components/active-events';
import {
  DismissibleAlert,
  alertSignature,
} from '@/features/dashboard/components/dismissible-alert';
import { ExamsChart } from '@/features/dashboard/components/exams-chart';
import { KpiCard } from '@/features/dashboard/components/kpi-card';
import { UpcomingAppointments } from '@/features/dashboard/components/upcoming-appointments';
import { useUser } from '@/lib/auth';

dayjs.locale('fr');

const RDV_STATUT_BADGES = [
  {
    key: 'en_attente',
    dotClass: 'bg-amber-500',
    textClass: 'text-amber-700',
    label: 'En att.',
  },
  {
    key: 'confirme',
    dotClass: 'bg-blue-600',
    textClass: 'text-blue-700',
    label: 'Conf.',
  },
  {
    key: 'present',
    dotClass: 'bg-emerald-600',
    textClass: 'text-emerald-700',
    label: 'Présent',
  },
  {
    key: 'absent',
    dotClass: 'bg-slate-400',
    textClass: 'text-slate-500',
    label: 'Absent',
  },
  {
    key: 'annule',
    dotClass: 'bg-red-500',
    textClass: 'text-red-600',
    label: 'Annulé',
  },
] as const;

function DashboardSkeleton() {
  return (
    <div className="flex h-48 items-center justify-center">
      <Spinner size="lg" />
    </div>
  );
}

function getGreeting(): string {
  const hour = dayjs().hour();
  if (hour < 12) return 'Bonjour';
  if (hour < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();
  const { user } = useUser();

  const dateLabel = dayjs().format('dddd D MMMM YYYY');
  const greeting = getGreeting();
  const displayName = user?.name || user?.email || 'Utilisateur';

  return (
    <Shell title="Tableau de bord">
      <div className="space-y-6">
        {/* Greeting */}
        <div>
          <h2 className="text-xl font-semibold text-foreground">
            {greeting}, {displayName}
          </h2>
          <p className="mt-0.5 text-sm capitalize text-muted-foreground">
            {dateLabel}
          </p>
        </div>

        {/* Pending RDV alert */}
        {!isLoading && data && (data.rendez_vous.pending_count ?? 0) > 0 && (
          <DismissibleAlert
            storageKey="dashboard.alert.rdv_pending"
            signature={alertSignature(data.rendez_vous.pending_count)}
            href="/gestion/rendez-vous?tab=liste&statut=en_attente"
            className="border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 dark:border-amber-400/20 dark:bg-amber-400/[0.06] dark:text-amber-300 dark:hover:bg-amber-400/[0.10]"
            icon={
              <AlertCircle className="size-4 shrink-0 text-amber-500 dark:text-amber-400" />
            }
          >
            {data.rendez_vous.pending_count} réservation
            {data.rendez_vous.pending_count > 1 ? 's' : ''} en attente de
            confirmation
          </DismissibleAlert>
        )}

        {/* Pending event inscriptions alert */}
        {!isLoading && data && (data.evenements.pending_count ?? 0) > 0 && (
          <DismissibleAlert
            storageKey="dashboard.alert.events_pending"
            signature={alertSignature(data.evenements.pending_count)}
            href="/gestion/evenements?statut=en_cours"
            className="border-violet-200 bg-violet-50 text-violet-800 hover:bg-violet-100 dark:border-violet-400/20 dark:bg-violet-400/[0.06] dark:text-violet-300 dark:hover:bg-violet-400/[0.10]"
            icon={
              <AlertCircle className="size-4 shrink-0 text-violet-500 dark:text-violet-400" />
            }
          >
            {data.evenements.pending_count} inscription
            {data.evenements.pending_count > 1 ? 's' : ''} à un événement en
            attente de check-in
          </DismissibleAlert>
        )}

        {isLoading ? (
          <DashboardSkeleton />
        ) : !data ? (
          <div className="rounded-lg border border-dashed border-border p-8 text-center">
            <p className="text-sm text-muted-foreground">
              Impossible de charger les données du tableau de bord.
            </p>
          </div>
        ) : (
          <>
            {/* KPI Row */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <KpiCard
                title="Patients"
                value={data.patients.total}
                subtitle={`+${data.patients.today_new} aujourd'hui`}
                icon={Users}
                trend={data.patients.today_new}
              />
              <KpiCard
                title="Examens aujourd'hui"
                value={data.examens.today.total}
                subtitle={`${data.examens.today.adult} adultes, ${data.examens.today.child} enfants`}
                icon={ClipboardList}
              />
              <KpiCard
                title="Conducteurs"
                value={data.conducteurs.total}
                subtitle={`+${data.conducteurs.today_new} aujourd'hui`}
                icon={Truck}
                trend={data.conducteurs.today_new}
              />
              <KpiCard
                title="Rendez-vous aujourd'hui"
                value={data.rendez_vous.today.total}
                subtitle="total planifiés"
                icon={CalendarCheck}
              >
                {data.rendez_vous.today.by_statut &&
                  Object.keys(data.rendez_vous.today.by_statut).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t pt-2">
                      {RDV_STATUT_BADGES.filter(
                        ({ key }) =>
                          (data.rendez_vous.today.by_statut[key] ?? 0) > 0,
                      ).map(({ key, dotClass, textClass, label }) => (
                        <span
                          key={key}
                          className={`flex items-center gap-1 text-xs ${textClass}`}
                        >
                          <span
                            className={`inline-block size-1.5 rounded-full ${dotClass}`}
                          />
                          {data.rendez_vous.today.by_statut[key]} {label}
                        </span>
                      ))}
                    </div>
                  )}
              </KpiCard>
            </div>

            {/* Charts Row */}
            <div className="grid gap-4 lg:grid-cols-2">
              <ExamsChart data={data.examens.last_7_days} />
              <UpcomingAppointments appointments={data.rendez_vous.prochains} />
            </div>

            {/* Events Section */}
            {data.evenements.en_cours.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-foreground">
                    Événements en cours
                  </h3>
                  {data.evenements.inscriptions_aujourd_hui > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {data.evenements.inscriptions_aujourd_hui} inscription
                      {data.evenements.inscriptions_aujourd_hui > 1
                        ? 's'
                        : ''}{' '}
                      aujourd&apos;hui
                    </span>
                  )}
                </div>
                <ActiveEvents events={data.evenements.en_cours} />
              </div>
            )}

            {/* Planned events in next 7 days */}
            {data.evenements.planifies_7j.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">
                  Événements planifiés (7 prochains jours)
                </h3>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {data.evenements.planifies_7j.map((event) => (
                    <Link
                      key={event.id}
                      href={`/gestion/evenements/${event.id}/inscriptions`}
                      className="group rounded-lg border border-border bg-card p-4 transition-shadow hover:shadow-sm block"
                    >
                      <p className="text-sm font-medium text-foreground group-hover:text-primary">
                        {event.titre}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {dayjs(event.date_event).isValid()
                          ? `${dayjs(event.date_event).format('DD/MM/YYYY')} — ${event.lieu}`
                          : event.lieu}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {event.inscrits} inscrits
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Shell>
  );
}
