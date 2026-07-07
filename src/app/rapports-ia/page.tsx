'use client';

import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { AppShell as Shell } from '@/app/_shell';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/ui/can';
import { Input } from '@/components/ui/form/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form/select';
import { paths } from '@/config/paths';
import { useReports } from '@/features/ai-reports/api/get-reports';
import { ReportGenerateDialog } from '@/features/ai-reports/components/report-generate-dialog';
import { ReportListTable } from '@/features/ai-reports/components/report-list-table';
import {
  REPORT_STATUS,
  REPORT_STATUS_LABELS,
  type ReportStatus,
} from '@/features/ai-reports/types';
import { useDialogCleanup } from '@/hooks/use-dialog-cleanup';

const ITEMS_PER_PAGE = 20;
const ALL_STATUSES = '__all__';

export default function RapportsIaPage() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  useDialogCleanup([showGenerateDialog]);

  const { data, isLoading, isError } = useReports({
    params: {
      limit: ITEMS_PER_PAGE,
      offset: (currentPage - 1) * ITEMS_PER_PAGE,
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(dateFrom ? { date_from: dateFrom } : {}),
      ...(dateTo ? { date_to: dateTo } : {}),
    },
  });

  const reports = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const openDetail = (reportId: number) =>
    router.push(paths.aiReports.detail.getHref(reportId));

  return (
    <Can permission="ai-reports:view">
      <Shell title="Rapports IA">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={statusFilter || ALL_STATUSES}
              onValueChange={(v) => {
                setStatusFilter(v === ALL_STATUSES ? '' : v);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-52 text-sm">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_STATUSES}>Tous les statuts</SelectItem>
                {Object.values(REPORT_STATUS).map((status) => (
                  <SelectItem key={status} value={status}>
                    {REPORT_STATUS_LABELS[status as ReportStatus]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              className="w-40"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Date de début"
            />
            <Input
              type="date"
              className="w-40"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setCurrentPage(1);
              }}
              aria-label="Date de fin"
            />
            <div className="flex-1" />
            <Can permission="ai-reports:generate">
              <Button size="sm" onClick={() => setShowGenerateDialog(true)}>
                <Sparkles className="mr-1.5 size-3.5" aria-hidden />
                Générer un rapport
              </Button>
            </Can>
          </div>

          <p className="text-sm text-muted-foreground">
            {totalCount} rapport{totalCount !== 1 ? 's' : ''}
            {statusFilter
              ? ` · ${REPORT_STATUS_LABELS[statusFilter as ReportStatus] ?? statusFilter}`
              : ''}
          </p>

          {isError && (
            <div
              className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
              role="alert"
            >
              Impossible de charger les rapports. Vérifiez votre connexion puis
              réessayez.
            </div>
          )}

          <ReportListTable
            reports={reports}
            isLoading={isLoading}
            onRowClick={openDetail}
          />

          {totalPages > 1 && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Page {currentPage} sur {totalPages} ({totalCount} résultats)
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="size-4" aria-hidden />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="size-4" aria-hidden />
                </Button>
              </div>
            </div>
          )}
        </div>

        <ReportGenerateDialog
          open={showGenerateDialog}
          onOpenChange={setShowGenerateDialog}
          onGenerated={openDetail}
        />
      </Shell>
    </Can>
  );
}
