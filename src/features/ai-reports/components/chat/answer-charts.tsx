'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import type { SourceDisplay } from '../../types';

/**
 * Répartitions de la réponse, tracées.
 *
 * L'assistant citait ses répartitions en prose — « 52,7 % d'hypermétropes,
 * 31,2 % d'emmétropes, 16,1 % de myopes » — à charge pour le lecteur de les
 * reconstruire mentalement. Les valeurs existaient pourtant déjà, agrégées et
 * passées par la suppression des petits effectifs : elles n'étaient simplement
 * pas transmises.
 *
 * Rien de neuf n'est affiché ici : exactement ce que le texte énonce.
 */
const LIBELLES: Record<string, string> = {
  distribution_pct: 'Répartition (%)',
  symptom_distribution: 'Symptômes les plus fréquents',
  sex_distribution: 'Répartition par sexe',
  conclusion_distribution: 'Conclusions',
};

const titre = (cle: string) =>
  LIBELLES[cle] ??
  cle.replaceAll('_', ' ').replace(/^./, (c) => c.toUpperCase());

export function AnswerCharts({
  sources,
}: {
  sources?: SourceDisplay[] | null;
}) {
  const graphiques = (sources ?? []).flatMap((source) =>
    (source.distributions ?? []).map((distribution) => ({
      cle: `${source.tool}-${distribution.cle}`,
      titre: titre(distribution.cle),
      source: source.label,
      valeurs: distribution.valeurs,
    })),
  );

  if (graphiques.length === 0) return null;

  return (
    <div className="space-y-3">
      {graphiques.map((graphique) => (
        <figure
          key={graphique.cle}
          className="rounded-md border border-border p-2"
        >
          <figcaption className="mb-1 text-xs font-medium text-muted-foreground">
            {graphique.titre}
            <span className="ml-1 font-normal">— {graphique.source}</span>
          </figcaption>
          {/* Le tableau de valeurs reste accessible aux lecteurs d'écran : un
              graphique seul ne dit rien à qui ne le voit pas. */}
          <div className="sr-only">
            <table>
              <tbody>
                {graphique.valeurs.map((entree) => (
                  <tr key={entree.label}>
                    <th scope="row">{entree.label}</th>
                    <td>{entree.valeur}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="h-40 w-full" aria-hidden>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={graphique.valeurs}
                margin={{ top: 4, right: 8, bottom: 4, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={48}
                />
                <YAxis tick={{ fontSize: 10 }} width={36} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar
                  dataKey="valeur"
                  fill="hsl(var(--primary))"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </figure>
      ))}
    </div>
  );
}
