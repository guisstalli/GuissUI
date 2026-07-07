import { useQuery } from '@tanstack/react-query';

import { getReportQueryOptions } from '../api/get-report';
import { REPORT_STATUS_TERMINAL, type ReportStatus } from '../types';

const POLL_INTERVAL_MS = 3000;

/**
 * Suit un rapport en cours de génération (202 → PENDING → statut terminal).
 * Polling toutes les 3 s TANT QUE le statut n'est pas terminal — un statut
 * inconnu (ajouté côté backend) continue donc d'être suivi plutôt que d'être
 * traité à tort comme terminal.
 */
export const useReportPolling = (reportId: number | null) =>
  useQuery({
    ...getReportQueryOptions(reportId ?? -1),
    enabled: reportId !== null,
    refetchInterval: (query) => {
      const status = query.state.data?.status as ReportStatus | undefined;
      if (status === undefined) return false;
      return REPORT_STATUS_TERMINAL.includes(status) ? false : POLL_INTERVAL_MS;
    },
    refetchIntervalInBackground: false,
  });
