import { Badge } from '@/components/ui/badge';

import {
  REPORT_STATUS,
  REPORT_STATUS_LABELS,
  type ReportStatus,
} from '../types';

type ReportStatusBadgeProps = {
  /** Statut brut renvoyé par l'API (chaîne — voir reportListItemSchema). */
  status: string;
};

/**
 * Classes de couleur par statut. Un statut inconnu (ajouté côté backend) tombe
 * sur un style neutre plutôt que de casser le rendu.
 */
const STATUS_CLASS: Record<ReportStatus, string> = {
  [REPORT_STATUS.PENDING]:
    'border-amber-300 bg-amber-100 text-amber-800 dark:border-amber-600 dark:bg-amber-900/40 dark:text-amber-300',
  [REPORT_STATUS.DRAFT]:
    'border-blue-300 bg-blue-100 text-blue-700 dark:border-blue-600 dark:bg-blue-900/40 dark:text-blue-300',
  [REPORT_STATUS.APPROVED]:
    'border-green-300 bg-green-100 text-green-700 dark:border-green-600 dark:bg-green-900/40 dark:text-green-300',
  [REPORT_STATUS.REJECTED]:
    'border-red-300 bg-red-100 text-red-700 dark:border-red-600 dark:bg-red-900/40 dark:text-red-300',
  [REPORT_STATUS.DELIVERED]:
    'border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300',
  [REPORT_STATUS.FAILED]:
    'border-red-300 bg-red-100 text-red-700 dark:border-red-600 dark:bg-red-900/40 dark:text-red-300',
};

const NEUTRAL_CLASS =
  'border-gray-300 bg-gray-100 text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300';

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  const knownStatus = status as ReportStatus;
  const label = REPORT_STATUS_LABELS[knownStatus] ?? status;
  const className = STATUS_CLASS[knownStatus] ?? NEUTRAL_CLASS;

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
