'use client';

import {
  AlertTriangle,
  Bot,
  CalendarClock,
  FileText,
  ShieldAlert,
  Stethoscope,
  Truck,
  UserPlus,
  Users,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

import { useAdminDashboard } from '../api/get-admin-dashboard';
import {
  DASHBOARD_WINDOWS,
  type AdminDashboardUsers,
  type DashboardWindow,
} from '../types/schemas';

import { ActivityChart } from './activity-chart';
import { BreakdownBars } from './breakdown-bars';
import { RunsPerDayChart } from './runs-per-day-chart';
import { TrendStat } from './trend-stat';

const numberFormatter = new Intl.NumberFormat('fr-FR');

function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

function formatUsd(value: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * État des comptes en une seule carte.
 *
 * Trois cartes séparées « Total / Actifs / Vérifiés » affichaient trois fois le
 * même nombre sur une petite installation, sans jamais montrer ce qui compte :
 * la PART des comptes actifs et vérifiés. On garde un seul total, et on exprime
 * les deux autres en proportion.
 */
function AccountsHealthCard({ users }: { users: AdminDashboardUsers }) {
  const ratios = [
    {
      label: 'Comptes actifs',
      value: users.active,
      complement: `${formatNumber(users.inactive)} désactivés`,
    },
    {
      label: 'Adresses vérifiées',
      value: users.verified,
      complement: `${formatNumber(users.unverified)} en attente`,
    },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">État des comptes</CardTitle>
        <p className="text-xs text-muted-foreground">
          {formatNumber(users.total)} comptes au total
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {ratios.map((ratio) => {
          const percent =
            users.total > 0 ? Math.round((ratio.value / users.total) * 100) : 0;
          return (
            <div key={ratio.label}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="text-foreground">{ratio.label}</span>
                <span className="font-semibold tabular-nums">
                  {formatNumber(ratio.value)}
                  <span className="ml-1.5 font-normal text-muted-foreground">
                    {percent} %
                  </span>
                </span>
              </div>
              <div
                className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                role="presentation"
              >
                <div
                  className="h-full rounded-full bg-primary"
                  style={{ width: `${percent}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {ratio.complement}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

/** Volumétrie cumulée : des STOCKS, sans comparateur (ils ne varient pas par fenêtre). */
function VolumetryCard({
  entries,
}: {
  entries: {
    label: string;
    value: number;
    icon: ComponentType<{ className?: string }>;
  }[];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          Volumétrie cumulée
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Totaux depuis la mise en service, hors éléments supprimés.
        </p>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3 lg:grid-cols-6">
          {entries.map(({ label, value, icon: Icon }) => (
            <div key={label} className="min-w-0">
              <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Icon className="size-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">{label}</span>
              </dt>
              <dd className="mt-0.5 text-xl font-semibold tabular-nums text-foreground">
                {formatNumber(value)}
              </dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const [days, setDays] = useState<DashboardWindow>(14);
  const { data, isLoading, isError, refetch } = useAdminDashboard(days);

  const periodLabel = data ? `${data.window_days} j préc.` : 'période préc.';

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Vue d&apos;ensemble de la plateforme
          {data && (
            <span className="ml-1">— {data.window_days} derniers jours</span>
          )}
        </p>
        <div className="inline-flex overflow-hidden rounded-md border border-input">
          {DASHBOARD_WINDOWS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setDays(w)}
              className={`px-3 py-1.5 text-sm transition-colors ${
                days === w
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-transparent text-muted-foreground hover:bg-muted'
              }`}
              aria-pressed={days === w}
            >
              {w} j
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="md" />
        </div>
      ) : isError || !data ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border text-center">
          <AlertTriangle className="size-10 text-destructive" />
          <p className="text-sm text-muted-foreground">
            Impossible de charger le tableau de bord.
          </p>
          <button
            type="button"
            onClick={() => refetch()}
            className="text-sm font-medium text-primary hover:underline"
          >
            Réessayer
          </button>
        </div>
      ) : (
        <>
          {/* Ce qui a bougé : uniquement des FLUX, tous comparés à la période
              précédente de même longueur. C'est la ligne que l'admin lit en
              premier le matin. */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Ce qui a bougé
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <TrendStat
                label="Examens réalisés"
                value={data.activity.examens_window}
                previous={data.activity.examens_previous_window}
                periodLabel={periodLabel}
                icon={Stethoscope}
                hint={`${formatNumber(data.activity.adultes_window)} adultes · ${formatNumber(data.activity.enfants_window)} enfants`}
              />
              <TrendStat
                label="Exécutions IA"
                value={data.ai_traffic.runs_window}
                previous={data.ai_traffic.runs_previous_window}
                periodLabel={periodLabel}
                icon={Bot}
                hint={`${formatUsd(data.ai_traffic.cost_usd_window)} sur la période`}
              />
              <TrendStat
                label="Incidents de sécurité (7 j)"
                value={data.security.incidents_7d}
                previous={data.security.incidents_previous_7d}
                periodLabel="7 j préc."
                icon={ShieldAlert}
                higherIsBetter={false}
                hint={`${formatNumber(data.security.login_failed_7d)} échecs de connexion · ${formatNumber(data.security.access_denied_7d)} accès refusés`}
              />
              <TrendStat
                label="Nouveaux comptes (30 j)"
                value={data.users.new_last_30d}
                previous={data.users.new_previous_30d}
                periodLabel="30 j préc."
                icon={UserPlus}
              />
            </div>
          </section>

          {/* Deux séries temporelles côte à côte : l'activité métier et la
              charge IA. Les lire ensemble permet de rapporter l'une à l'autre. */}
          <section className="grid gap-4 lg:grid-cols-2">
            <ActivityChart data={data.activity.examens_per_day} />
            <RunsPerDayChart data={data.ai_traffic.runs_per_day} />
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Comptes et accès
            </h2>
            <div className="grid gap-4 lg:grid-cols-3">
              <AccountsHealthCard users={data.users} />
              <BreakdownBars
                title="Répartition par rôle"
                description="Qui compose l'équipe utilisatrice."
                entries={data.users.by_role}
                emptyMessage="Aucun compte enregistré."
              />
              <BreakdownBars
                title="Événements de sécurité (30 j)"
                description="Journal d'audit agrégé."
                entries={data.security.events_30d}
                emptyMessage="Aucun événement sur 30 jours."
              />
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Volumétrie et usage de l&apos;IA
            </h2>
            <VolumetryCard
              entries={[
                { label: 'Patients', value: data.system.patients, icon: Users },
                {
                  label: 'Conducteurs',
                  value: data.system.drivers,
                  icon: Truck,
                },
                {
                  label: 'Examens adultes',
                  value: data.system.examens_adultes,
                  icon: Stethoscope,
                },
                {
                  label: 'Examens enfants',
                  value: data.system.examens_enfants,
                  icon: Stethoscope,
                },
                {
                  label: 'Rapports IA',
                  value: data.system.rapports_ia,
                  icon: FileText,
                },
                {
                  label: 'Rendez-vous',
                  value: data.system.rendez_vous,
                  icon: CalendarClock,
                },
              ]}
            />
            <div className="grid gap-4 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Fiabilité de l&apos;agent IA
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Sur l&apos;ensemble de l&apos;historique.
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-semibold tabular-nums text-foreground">
                    {data.ai_traffic.success_rate === null
                      ? '—'
                      : `${data.ai_traffic.success_rate} %`}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {data.ai_traffic.success_rate === null
                      ? 'Aucune exécution enregistrée.'
                      : `${formatNumber(data.ai_traffic.success)} réussies · ${formatNumber(data.ai_traffic.failed)} en échec`}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Consommation cumulée
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Jetons et coût depuis la mise en service.
                  </p>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-muted-foreground">Coût total</span>
                    <span className="font-semibold tabular-nums">
                      {formatUsd(data.ai_traffic.cost_usd)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-muted-foreground">
                      Jetons en entrée
                    </span>
                    <span className="font-semibold tabular-nums">
                      {formatNumber(data.ai_traffic.tokens_in)}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-muted-foreground">
                      Jetons en sortie
                    </span>
                    <span className="font-semibold tabular-nums">
                      {formatNumber(data.ai_traffic.tokens_out)}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <BreakdownBars
                title="Exécutions par capacité"
                description="Quelles fonctions IA sont réellement utilisées."
                entries={data.ai_traffic.by_capability.map((entry) => ({
                  ...entry,
                  label: entry.key,
                }))}
                emptyMessage="Aucune exécution enregistrée."
              />
            </div>
          </section>

          <p className="text-xs text-muted-foreground">
            Données arrêtées au{' '}
            {new Date(data.generated_at).toLocaleString('fr-FR')}.
          </p>
        </>
      )}
    </div>
  );
}
