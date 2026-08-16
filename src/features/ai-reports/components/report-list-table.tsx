'use client';

import dayjs from 'dayjs';
import { Check, FileBarChart, Minus } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import {
  TableBody,
  TableCell,
  TableElement,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { ReportListItem } from '../types';
import { formatCost } from '../utils/format-cost';

import { ReportStatusBadge } from './report-status-badge';

interface ReportListTableProps {
  reports: ReportListItem[];
  isLoading?: boolean;
  onRowClick: (reportId: number) => void;
}

const SKELETON_ROWS = 5;
const COLUMN_COUNT = 6;

function VerificationCell({ passed }: { passed: boolean | null }) {
  if (passed === null) {
    return <span className="text-muted-foreground">—</span>;
  }
  return passed ? (
    <span className="inline-flex items-center gap-1 text-sm text-green-700 dark:text-green-400">
      <Check className="size-3.5" aria-hidden />
      Vérifié
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 text-sm text-amber-700 dark:text-amber-400">
      <Minus className="size-3.5" aria-hidden />
      Non vérifié
    </span>
  );
}

export function ReportListTable({
  reports,
  isLoading = false,
  onRowClick,
}: ReportListTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <TableElement className="bg-card">
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Demandeur</TableHead>
            <TableHead>Vérifié</TableHead>
            <TableHead className="text-right">Coût</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`}>
                {Array.from({ length: COLUMN_COUNT }).map((__, cellIndex) => (
                  <TableCell key={`skeleton-cell-${cellIndex}`}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : reports.length === 0 ? (
            <TableRow>
              <TableCell colSpan={COLUMN_COUNT} className="py-16">
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                  <FileBarChart
                    className="text-muted-foreground/40 size-10"
                    aria-hidden
                  />
                  <p className="font-medium text-muted-foreground">
                    Aucun rapport trouvé
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            reports.map((report) => (
              <TableRow
                key={report.id}
                role="button"
                tabIndex={0}
                aria-label={`Ouvrir le rapport ${report.id}`}
                className="cursor-pointer"
                onClick={() => onRowClick(report.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onRowClick(report.id);
                  }
                }}
              >
                <TableCell className="font-medium">
                  {report.report_type ?? 'Question libre'}
                </TableCell>
                <TableCell>
                  <ReportStatusBadge status={report.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {report.requester_email ?? '—'}
                </TableCell>
                <TableCell>
                  <VerificationCell passed={report.verification_passed} />
                </TableCell>
                <TableCell className="text-right font-mono text-sm tabular-nums">
                  {formatCost(report.cost_usd)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {dayjs(report.created_at).format('DD/MM/YYYY HH:mm')}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </TableElement>
    </div>
  );
}
