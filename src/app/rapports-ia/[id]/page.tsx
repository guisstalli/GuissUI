'use client';

import { ArrowLeft, Ban, CheckCircle, Loader2, Send } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { AppShell as Shell } from '@/app/_shell';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/ui/can';
import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';
import { ReportApproveDialog } from '@/features/ai-reports/components/report-approve-dialog';
import { ReportDeliverDialog } from '@/features/ai-reports/components/report-deliver-dialog';
import { ReportDetailSummary } from '@/features/ai-reports/components/report-detail-summary';
import { ReportRejectDialog } from '@/features/ai-reports/components/report-reject-dialog';
import { useReportPolling } from '@/features/ai-reports/hooks/use-report-polling';
import { REPORT_STATUS } from '@/features/ai-reports/types';
import { useDialogCleanup } from '@/hooks/use-dialog-cleanup';

export default function RapportIaDetailPage() {
  const params = useParams<{ id: string }>();
  const reportId = Number(params.id);
  const validId = Number.isInteger(reportId) && reportId > 0;

  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showDeliver, setShowDeliver] = useState(false);

  useDialogCleanup([showApprove, showReject, showDeliver]);

  const {
    data: report,
    isLoading,
    isError,
  } = useReportPolling(validId ? reportId : null);

  const backLink = (
    <Button asChild variant="ghost" size="sm" className="w-fit">
      <Link href={paths.aiReports.list.getHref()}>
        <ArrowLeft className="mr-1.5 size-4" aria-hidden />
        Retour aux rapports
      </Link>
    </Button>
  );

  if (!validId || isError) {
    return (
      <Can permission="ai-reports:view">
        <Shell title="Rapport IA">
          <div className="space-y-4">
            {backLink}
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
              <p className="font-medium text-muted-foreground">
                Rapport introuvable ou accès non autorisé.
              </p>
              <p className="mt-1 max-w-md text-sm text-muted-foreground">
                Seuls le demandeur du rapport et les approbateurs
                (médecin/admin) peuvent consulter un rapport.
              </p>
            </div>
          </div>
        </Shell>
      </Can>
    );
  }

  if (isLoading || !report) {
    return (
      <Can permission="ai-reports:view">
        <Shell title="Rapport IA">
          <div className="space-y-4">
            {backLink}
            <div className="flex items-center justify-center py-24">
              <Spinner />
            </div>
          </div>
        </Shell>
      </Can>
    );
  }

  return (
    <Can permission="ai-reports:view">
      <Shell title={`Rapport IA #${report.id}`}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {backLink}

            <div className="flex flex-wrap items-center gap-2">
              {report.status === REPORT_STATUS.DRAFT && (
                <Can permission="ai-reports:approve">
                  <Button size="sm" onClick={() => setShowApprove(true)}>
                    <CheckCircle className="mr-1.5 size-3.5" aria-hidden />
                    Approuver
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => setShowReject(true)}
                  >
                    <Ban className="mr-1.5 size-3.5" aria-hidden />
                    Rejeter
                  </Button>
                </Can>
              )}
              {report.status === REPORT_STATUS.APPROVED && (
                <Can permission="ai-reports:deliver">
                  <Button size="sm" onClick={() => setShowDeliver(true)}>
                    <Send className="mr-1.5 size-3.5" aria-hidden />
                    Diffuser
                  </Button>
                </Can>
              )}
            </div>
          </div>

          {report.status === REPORT_STATUS.PENDING && (
            <div className="flex items-center gap-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
              Génération en cours — cette page se met à jour automatiquement.
            </div>
          )}

          <ReportDetailSummary report={report} />
        </div>

        <ReportApproveDialog
          reportId={report.id}
          open={showApprove}
          onOpenChange={setShowApprove}
        />
        <ReportRejectDialog
          reportId={report.id}
          open={showReject}
          onOpenChange={setShowReject}
        />
        <ReportDeliverDialog
          reportId={report.id}
          open={showDeliver}
          onOpenChange={setShowDeliver}
        />
      </Shell>
    </Can>
  );
}
