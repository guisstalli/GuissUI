'use client';

import dayjs from 'dayjs';
import {
  Ban,
  Check,
  CheckCircle,
  Download,
  ExternalLink,
  Loader2,
  Minus,
  Send,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Can } from '@/components/ui/can';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';
import { useDialogCleanup } from '@/hooks/use-dialog-cleanup';
import {
  useDocumentPanelStore,
  type DocumentPanelTab,
} from '@/stores/document-panel-store';
import { useReportProgress } from '@/stores/report-progress-store';
import { cn } from '@/utils/cn';

import { useReportPolling } from '../../hooks/use-report-polling';
import { REPORT_STATUS, type ReportDetail } from '../../types';
import { formatCost } from '../../utils/format-cost';
import { ReportApproveDialog } from '../report-approve-dialog';
import { ReportDeliverDialog } from '../report-deliver-dialog';
import { ReportRejectDialog } from '../report-reject-dialog';
import { ReportStatusBadge } from '../report-status-badge';

import { ReportEditor } from './report-editor';

type ReportDocumentPanelProps = {
  reportId: number;
};

const TABS: { id: DocumentPanelTab; label: string }[] = [
  { id: 'apercu', label: 'Aperçu' },
  { id: 'sources', label: 'Sources' },
  { id: 'verification', label: 'Vérification' },
];

const formatDate = (value: string | null): string =>
  value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—';

function MetaRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

/** Onglet Sources : périmètre réellement appliqué + consignes + coût du tour. */
function SourcesTab({ report }: { report: ReportDetail }) {
  const filtres = Object.entries(report.filters ?? {});

  return (
    <div className="space-y-4">
      <section>
        <h3 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
          Périmètre appliqué
        </h3>
        {filtres.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun filtre — périmètre complet.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-1.5">
            {filtres.map(([cle, valeur]) => (
              <li
                key={cle}
                className="bg-muted/60 rounded-md border border-border px-2 py-0.5 text-xs"
              >
                <span className="text-muted-foreground">{cle} : </span>
                {String(valeur)}
              </li>
            ))}
          </ul>
        )}
      </section>

      {report.prompt && (
        <section>
          <h3 className="mb-2 text-xs uppercase tracking-wide text-muted-foreground">
            Consignes du demandeur
          </h3>
          <p className="bg-muted/50 whitespace-pre-wrap rounded-md p-3 text-sm">
            {report.prompt}
          </p>
        </section>
      )}

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
        <MetaRow label="Demandeur">{report.requester_email ?? '—'}</MetaRow>
        <MetaRow label="Créé le">{formatDate(report.created_at)}</MetaRow>
        <MetaRow label="Modèle">
          {report.llm_backend} · {report.model_used || '—'}
        </MetaRow>
        <MetaRow label="Coût estimé">{formatCost(report.cost_usd)}</MetaRow>
        <MetaRow label="Niveau de risque">{report.risk_tier ?? '—'}</MetaRow>
        <MetaRow label="Tokens (in / out)">
          {report.tokens_in} / {report.tokens_out}
        </MetaRow>
      </dl>
    </div>
  );
}

/** Onglet Vérification : verdict d'ancrage + traçabilité de l'approbation. */
function VerificationTab({ report }: { report: ReportDetail }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-md border border-border p-3">
        {report.verification_passed === null ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <Minus className="size-4" aria-hidden /> Vérification non applicable
          </span>
        ) : report.verification_passed ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-green-700 dark:text-green-400">
            <Check className="size-4" aria-hidden /> Chiffres vérifiés — chaque
            valeur est ancrée dans une source
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sm text-amber-700 dark:text-amber-400">
            <Minus className="size-4" aria-hidden /> Vérification non passée —
            relire les chiffres avant approbation
          </span>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-3">
        <MetaRow label="Approuvé par">
          {report.approved_by_email ?? '—'}
          {report.approved_at ? ` · ${formatDate(report.approved_at)}` : ''}
        </MetaRow>
        <MetaRow label="Diffusé le">{formatDate(report.delivered_at)}</MetaRow>
      </dl>

      {report.rejection_reason && (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
          role="alert"
        >
          <p className="font-medium">Motif du rejet</p>
          <p className="mt-1 whitespace-pre-wrap">{report.rejection_reason}</p>
        </div>
      )}

      {/* Détail brut du rapport de vérification : utile à un approbateur qui
          veut savoir QUEL contrôle a échoué, pas seulement que ça a échoué. */}
      {report.verification_report != null && (
        <details className="rounded-md border border-border">
          <summary className="cursor-pointer px-3 py-2 text-sm text-muted-foreground">
            Détail des contrôles
          </summary>
          <pre className="max-h-64 overflow-auto px-3 pb-3 text-xs">
            {JSON.stringify(report.verification_report, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}

/**
 * Aperçu d'un rapport, rendu à droite du fil de conversation.
 *
 * Remplace le détour par /rapports-ia/[id] : le rapport se lit, se vérifie et
 * s'approuve sans quitter la conversation qui l'a produit. La page détail reste
 * en place — elle sert d'archive et de cible de partage (lien « pleine page »).
 *
 * SÉCURITÉ : le markdown vient d'un modèle de langage. Il passe par le même
 * `MarkdownContent` que le chat (HTML brut neutralisé, images distantes
 * interdites) — ne jamais le rendre autrement pour « faire joli ».
 */
export function ReportDocumentPanel({ reportId }: ReportDocumentPanelProps) {
  const tab = useDocumentPanelStore((etat) => etat.tab);
  const changerOnglet = useDocumentPanelStore((etat) => etat.changerOnglet);
  const fermer = useDocumentPanelStore((etat) => etat.fermer);

  const [showApprove, setShowApprove] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showDeliver, setShowDeliver] = useState(false);
  useDialogCleanup([showApprove, showReject, showDeliver]);

  const { data: report, isLoading, isError } = useReportPolling(reportId);
  // Étape en cours poussée par le WebSocket ; le polling ci-dessus reste le
  // filet si la socket est coupée.
  const progression = useReportProgress(reportId);

  const enTete = (
    <div className="flex items-start gap-2 border-b border-border p-3">
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-semibold">
          {report?.report_type ?? 'Rapport analytique'}
        </h2>
        <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
          <span>#{reportId}</span>
          {report && <ReportStatusBadge status={report.status} />}
        </p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={fermer}
        aria-label="Fermer l'aperçu du document"
      >
        <X className="size-4" aria-hidden />
      </Button>
    </div>
  );

  if (isError) {
    return (
      <div className="flex h-full flex-col">
        {enTete}
        <div className="flex flex-1 items-center justify-center p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Rapport introuvable ou accès non autorisé.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading || !report) {
    return (
      <div className="flex h-full flex-col">
        {enTete}
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      </div>
    );
  }

  const enGeneration = report.status === REPORT_STATUS.PENDING;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {enTete}

      <div
        className="flex gap-1 border-b border-border px-3 py-1.5"
        role="tablist"
        aria-label="Sections du document"
      >
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            type="button"
            role="tab"
            id={`onglet-${id}`}
            aria-selected={tab === id}
            aria-controls={`panneau-${id}`}
            onClick={() => changerOnglet(id)}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
              tab === id
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <ScrollArea className="min-h-0 flex-1">
        <div className="p-4">
          {enGeneration && (
            <div className="mb-4 flex items-center gap-3 rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">
              <Loader2 className="size-4 shrink-0 animate-spin" aria-hidden />
              {/* Libellé fourni par le SERVEUR : lui seul sait où il en est. */}
              <span aria-live="polite" aria-atomic="true">
                {progression
                  ? `${progression.label}…`
                  : 'Génération en cours — cet aperçu se met à jour automatiquement.'}
              </span>
            </div>
          )}

          {report.error_message && (
            <div
              className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
              role="alert"
            >
              <p className="font-medium">Erreur de génération</p>
              <p className="mt-1 whitespace-pre-wrap">{report.error_message}</p>
            </div>
          )}

          {/* Chaque section est un `tabpanel` nommé par son onglet : sans cela
              les boutons portaient role="tab" sans rien contrôler, et la
              structure était incompréhensible pour un lecteur d'écran. */}
          {tab === 'apercu' && (
            <div
              role="tabpanel"
              id="panneau-apercu"
              aria-labelledby="onglet-apercu"
            >
              {report.markdown || !enGeneration ? (
                <ReportEditor report={report} />
              ) : null}
            </div>
          )}
          {tab === 'sources' && (
            <div
              role="tabpanel"
              id="panneau-sources"
              aria-labelledby="onglet-sources"
            >
              <SourcesTab report={report} />
            </div>
          )}
          {tab === 'verification' && (
            <div
              role="tabpanel"
              id="panneau-verification"
              aria-labelledby="onglet-verification"
            >
              <VerificationTab report={report} />
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="flex flex-wrap items-center gap-2 border-t border-border p-3">
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

        <div className="ml-auto flex flex-wrap items-center gap-2">
          {report.pdf_url && (
            <Button asChild variant="outline" size="sm">
              <a href={report.pdf_url} target="_blank" rel="noreferrer">
                <Download className="mr-1.5 size-3.5" aria-hidden />
                PDF
              </a>
            </Button>
          )}
          {report.docx_url && (
            <Button asChild variant="outline" size="sm">
              <a href={report.docx_url} target="_blank" rel="noreferrer">
                <Download className="mr-1.5 size-3.5" aria-hidden />
                DOCX
              </a>
            </Button>
          )}
          <Button asChild variant="ghost" size="sm">
            <Link href={paths.aiReports.detail.getHref(reportId)}>
              <ExternalLink className="mr-1.5 size-3.5" aria-hidden />
              Pleine page
            </Link>
          </Button>
        </div>
      </div>

      <ReportApproveDialog
        reportId={reportId}
        open={showApprove}
        onOpenChange={setShowApprove}
      />
      <ReportRejectDialog
        reportId={reportId}
        open={showReject}
        onOpenChange={setShowReject}
      />
      <ReportDeliverDialog
        reportId={reportId}
        open={showDeliver}
        onOpenChange={setShowDeliver}
      />
    </div>
  );
}
