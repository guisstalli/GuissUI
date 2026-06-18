import { BarChart3, Download } from 'lucide-react';

import { Button } from '@/components/ui/button';

type CohortActionBarProps = {
  selectionCount: number;
  onExportCsv: () => void;
  onAnalyze: () => void;
};

export const CohortActionBar = ({
  selectionCount,
  onExportCsv,
  onAnalyze,
}: CohortActionBarProps) => {
  const hasSelection = selectionCount > 0;

  return (
    <div className="bg-popover/95 supports-backdrop-filter:backdrop-blur sticky bottom-0 z-10 flex items-center justify-between gap-3 border-t p-4 backdrop-blur">
      <span className="text-sm text-muted-foreground">
        {hasSelection
          ? `${selectionCount} patient(s) sélectionné(s)`
          : 'Aucune sélection'}
      </span>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onExportCsv}
          disabled={!hasSelection}
        >
          <Download className="size-4" />
          Exporter CSV
        </Button>
        <Button size="sm" onClick={onAnalyze} disabled={!hasSelection}>
          <BarChart3 className="size-4" />
          Analyser la cohorte ({selectionCount})
        </Button>
      </div>
    </div>
  );
};
