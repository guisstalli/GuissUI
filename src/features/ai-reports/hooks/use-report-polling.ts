import { useQuery } from '@tanstack/react-query';

import { getReportQueryOptions } from '../api/get-report';
import { REPORT_STATUS_IN_PROGRESS, type ReportStatus } from '../types';

const POLL_INTERVAL_MS = 3000;

/**
 * Suit un rapport en cours de génération (202 → PENDING → statut terminal).
 * Polling toutes les 3 s tant que le statut est « en cours », arrêt net dès
 * qu'un statut terminal (DRAFT/APPROVED/REJECTED/DELIVERED/FAILED) arrive.
 */
export const useReportPolling = (reportId: number | null) =>
  useQuery({
    ...getReportQueryOptions(reportId ?? -1),
    enabled: reportId !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.status as ReportStatus | undefined;
      if (status && REPORT_STATUS_IN_PROGRESS.includes(status)) {
        return POLL_INTERVAL_MS;
      }
      return false;
    },
    refetchIntervalInBackground: false,
  });
