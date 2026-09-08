'use client';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Spinner } from '@/components/ui/spinner';

import { useTendance } from '../api/get-tendance';

type CourbeTendanceProps = {
  dateDebut: string;
  dateFin: string;
};

const formaterJour = (jour: string) => {
  const [, mois, quantieme] = jour.split('-');
  return `${quantieme}/${mois}`;
};

/**
 * Anomalies jour par jour.
 *
 * Un total isolé ne dit pas s'il s'agit d'un incident ponctuel ou d'une dérive
 * installée. Sur août 2026, le 23 ressort comme un pic massif — 114 examens,
 * 15 doublons, 38 sans site — au milieu de journées à 3 ou 6 examens. C'est
 * cette FORME qui identifie une session ratée ; « 15 doublons » sur toute la
 * base n'aurait alarmé personne.
 *
 * Seules les journées porteuses d'examens figurent : combler les jours creux
 * avec des zéros ferait passer une campagne intensive pour une amélioration.
 */
export function CourbeTendance({ dateDebut, dateFin }: CourbeTendanceProps) {
  const { data, isLoading, isError } = useTendance({ dateDebut, dateFin });

  if (isLoading) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-lg border bg-card">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-lg border bg-card">
        <p className="text-sm text-destructive">
          Impossible de charger la tendance.
        </p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex h-[280px] items-center justify-center rounded-lg border bg-card">
        <p className="text-sm text-muted-foreground">
          Aucun examen sur la période.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <h3 className="mb-1 font-semibold">Évolution des anomalies</h3>
      <p className="mb-4 text-sm text-muted-foreground">
        Une anomalie isolée se corrige ; un pic signale une session à reprendre.
      </p>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart
          data={data}
          margin={{ top: 8, right: 12, left: -18, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="jour"
            tickFormatter={formaterJour}
            tick={{ fontSize: 12 }}
            className="fill-muted-foreground"
          />
          <YAxis tick={{ fontSize: 12 }} className="fill-muted-foreground" />
          <Tooltip
            labelFormatter={(jour) =>
              new Date(`${String(jour)}T00:00:00`).toLocaleDateString('fr-FR')
            }
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '0.5rem',
              fontSize: '0.8rem',
            }}
          />
          <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
          {/* Les examens servent de toile de fond : sans eux, 15 doublons sur
              114 examens et 15 sur 20 se ressemblent. */}
          <Line
            type="monotone"
            dataKey="examens"
            name="Examens"
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={1}
            strokeDasharray="4 4"
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="doublons"
            name="Doublons"
            stroke="hsl(var(--destructive))"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="sans_site"
            name="Sans site"
            stroke="#f59e0b"
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
