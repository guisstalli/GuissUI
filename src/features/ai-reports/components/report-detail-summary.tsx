'use client';

import dayjs from 'dayjs';
import { Check, Download, FileText, Minus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { ReportDetail } from '../types';
import { formatCost } from '../utils/format-cost';

import { MarkdownContent } from './markdown-content';
import { ReportStatusBadge } from './report-status-badge';

interface ReportDetailSummaryProps {
  report: ReportDetail;
}

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

function formatDate(value: string | null): string {
  return value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—';
}

export function ReportDetailSummary({ report }: ReportDetailSummaryProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">
            {report.report_type ?? 'Question libre'}
          </CardTitle>
          <ReportStatusBadge status={report.status} />
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 md:grid-cols-3">
            <MetaRow label="Demandeur">{report.requester_email ?? '—'}</MetaRow>
            <MetaRow label="Créé le">{formatDate(report.created_at)}</MetaRow>
            <MetaRow label="Vérification auto">
              {report.verification_passed === null ? (
                <span className="text-muted-foreground">—</span>
              ) : report.verification_passed ? (
                <span className="inline-flex items-center gap-1 text-green-700 dark:text-green-400">
                  <Check className="size-3.5" aria-hidden /> Vérifié
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                  <Minus className="size-3.5" aria-hidden /> Non vérifié
                </span>
              )}
            </MetaRow>
            <MetaRow label="Modèle">
              {report.llm_backend} · {report.model_used || '—'}
            </MetaRow>
            <MetaRow label="Tokens (in / out)">
              {report.tokens_in} / {report.tokens_out}
            </MetaRow>
            <MetaRow label="Coût estimé">{formatCost(report.cost_usd)}</MetaRow>
            <MetaRow label="Approuvé par">
              {report.approved_by_email ?? '—'}
              {report.approved_at ? ` · ${formatDate(report.approved_at)}` : ''}
            </MetaRow>
            <MetaRow label="Diffusé le">
              {formatDate(report.delivered_at)}
            </MetaRow>
            <MetaRow label="Niveau de risque">
              {report.risk_tier ?? '—'}
            </MetaRow>
          </dl>

          {report.prompt && (
            <div className="bg-muted/50 mt-4 rounded-md p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Consignes du demandeur
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm">
                {report.prompt}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {report.rejection_reason && (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
          role="alert"
        >
          <p className="font-medium">Motif du rejet</p>
          <p className="mt-1 whitespace-pre-wrap">{report.rejection_reason}</p>
        </div>
      )}

      {report.error_message && (
        <div
          className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300"
          role="alert"
        >
          <p className="font-medium">Erreur de génération</p>
          <p className="mt-1 whitespace-pre-wrap">{report.error_message}</p>
        </div>
      )}

      {/* Lecture directe. Le contenu était stocké mais servi uniquement sous
          forme de PDF : il fallait télécharger pour lire. `MarkdownContent`
          neutralise le HTML brut et bloque les images distantes — le texte
          vient d'un modèle de langage, il n'est pas de confiance. */}
      {report.markdown && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Rapport</CardTitle>
          </CardHeader>
          <CardContent>
            <MarkdownContent content={report.markdown} />
          </CardContent>
        </Card>
      )}

      {(report.pdf_url || report.docx_url) && (
        <div className="flex flex-wrap items-center gap-2">
          {report.pdf_url && (
            <Button asChild variant="outline" size="sm">
              <a href={report.pdf_url} target="_blank" rel="noreferrer">
                <Download className="mr-1.5 size-3.5" aria-hidden />
                Télécharger le PDF
              </a>
            </Button>
          )}
          {report.docx_url && (
            <Button asChild variant="outline" size="sm">
              <a href={report.docx_url} target="_blank" rel="noreferrer">
                <FileText className="mr-1.5 size-3.5" aria-hidden />
                Télécharger le DOCX
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
