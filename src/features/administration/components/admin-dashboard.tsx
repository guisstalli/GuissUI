'use client';

import {
  Activity,
  AlertTriangle,
  Bot,
  CalendarClock,
  DollarSign,
  Eye,
  FileText,
  ShieldX,
  Stethoscope,
  Truck,
  UserCheck,
  Users,
} from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { KpiCard } from '@/components/ui/kpi-card/kpi-card';
import { Spinner } from '@/components/ui/spinner';
import { getRoleLabel, type Role } from '@/lib/authorization';

import { useAdminDashboard } from '../api/get-admin-dashboard';
import { DASHBOARD_WINDOWS, type DashboardWindow } from '../types/schemas';

import { RunsPerDayChart } from './runs-per-day-chart';

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

function DistributionCard({
  title,
  entries,
  labelFor,
}: {
  title: string;
  entries: [string, number][];
  labelFor?: (key: string) => string;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {entries.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune donnée.</p>
        ) : (
          <ul className="space-y-2">
            {entries.map(([key, count]) => (
              <li
                key={key}
                className="flex items-center justify-between text-sm"
              >
                <span className="truncate text-foreground">
                  {labelFor ? labelFor(key) : key}
                </span>
                <span className="font-semibold tabular-nums">
                  {formatNumber(count)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function AdminDashboard() {
  const [days, setDays] = useState<DashboardWindow>(14);
  const { data, isLoading, isError, refetch } = useAdminDashboard(days);

  return (
    <div className="space-y-6">
      {/* Sélecteur de fenêtre */}
      <div className="flex items-center justify-between gap-3">
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
          {/* Utilisateurs */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Utilisateurs
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                title="Total"
                value={formatNumber(data.users.total)}
                icon={Users}
                subtitle={`${formatNumber(data.users.new_last_30d)} nouveaux (30 j)`}
              />
              <KpiCard
                title="Actifs"
                value={formatNumber(data.users.active)}
                icon={UserCheck}
                subtitle={`${formatNumber(data.users.inactive)} inactifs`}
              />
              <KpiCard
                title="Vérifiés"
                value={formatNumber(data.users.verified)}
                icon={UserCheck}
                subtitle={`${formatNumber(data.users.unverified)} non vérifiés`}
              />
              <DistributionCard
                title="Par rôle"
                entries={Object.entries(data.users.by_role)}
                labelFor={(key) => getRoleLabel(key as Role)}
              />
            </div>
          </section>

          {/* Volumétrie système */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Volumétrie
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <KpiCard
                title="Patients"
                value={formatNumber(data.system.patients)}
                icon={Users}
              />
              <KpiCard
                title="Conducteurs"
                value={formatNumber(data.system.drivers)}
                icon={Truck}
              />
              <KpiCard
                title="Examens adultes"
                value={formatNumber(data.system.examens_adultes)}
                icon={Stethoscope}
              />
              <KpiCard
                title="Examens enfants"
                value={formatNumber(data.system.examens_enfants)}
                icon={Stethoscope}
              />
              <KpiCard
                title="Rapports IA"
                value={formatNumber(data.system.rapports_ia)}
                icon={FileText}
              />
              <KpiCard
                title="Rendez-vous"
                value={formatNumber(data.system.rendez_vous)}
                icon={CalendarClock}
              />
            </div>
          </section>

          {/* Trafic IA */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Trafic IA
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                title="Exécutions"
                value={formatNumber(data.ai_traffic.total_runs)}
                icon={Bot}
                subtitle={`${formatNumber(data.ai_traffic.success)} ok · ${formatNumber(data.ai_traffic.failed)} échecs`}
              />
              <KpiCard
                title="Tokens entrée"
                value={formatNumber(data.ai_traffic.tokens_in)}
                icon={Activity}
                subtitle={`${formatNumber(data.ai_traffic.tokens_out)} en sortie`}
              />
              <KpiCard
                title="Coût"
                value={formatUsd(data.ai_traffic.cost_usd)}
                icon={DollarSign}
              />
              <DistributionCard
                title="Par capacité"
                entries={Object.entries(data.ai_traffic.by_capability)}
              />
            </div>
            <RunsPerDayChart data={data.ai_traffic.runs_per_day} />
          </section>

          {/* Sécurité */}
          <section className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Sécurité
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <KpiCard
                title="Connexions échouées (7 j)"
                value={formatNumber(data.security.login_failed_7d)}
                icon={ShieldX}
              />
              <KpiCard
                title="Accès refusés (7 j)"
                value={formatNumber(data.security.access_denied_7d)}
                icon={Eye}
              />
              <DistributionCard
                title="Événements (30 j)"
                entries={Object.entries(data.security.by_event_30d)}
              />
            </div>
          </section>
        </>
      )}
    </div>
  );
}
