import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const numberFormatter = new Intl.NumberFormat('fr-FR');

export type BreakdownEntry = {
  key: string;
  label: string;
  count: number;
};

type BreakdownBarsProps = {
  title: string;
  description?: string;
  entries: BreakdownEntry[];
  emptyMessage?: string;
};

/**
 * Répartition en barres proportionnelles.
 *
 * Une colonne de nombres alignés oblige l'œil à comparer mentalement des
 * chiffres ; une barre donne le rapport immédiatement. Les barres sont
 * relatives au PLUS GRAND poste, pas au total : sur une répartition très
 * déséquilibrée, un rapport au total écraserait tous les petits postes en
 * traits invisibles.
 */
export function BreakdownBars({
  title,
  description,
  entries,
  emptyMessage = 'Aucune donnée sur la période.',
}: BreakdownBarsProps) {
  const sorted = [...entries].sort((a, b) => b.count - a.count);
  const max = sorted[0]?.count ?? 0;
  const total = sorted.reduce((sum, entry) => sum + entry.count, 0);

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        {total === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <ul className="space-y-3">
            {sorted.map((entry) => (
              <li key={entry.key}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-foreground">
                    {entry.label}
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums">
                    {numberFormatter.format(entry.count)}
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      {Math.round((entry.count / total) * 100)} %
                    </span>
                  </span>
                </div>
                <div
                  className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                  role="presentation"
                >
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width: `${max > 0 ? (entry.count / max) * 100 : 0}%`,
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
