'use client';

import { AlertTriangle, FileText, Loader2 } from 'lucide-react';

import { Can } from '@/components/ui/can';
import {
  useDocumentPanelStore,
  useOpenReportId,
} from '@/stores/document-panel-store';
import { cn } from '@/utils/cn';

import { useReportPolling } from '../../hooks/use-report-polling';
import { REPORT_STATUS, type ReportArtifact } from '../../types';
import { ReportStatusBadge } from '../report-status-badge';

type ReportArtifactCardProps = {
  artifact: ReportArtifact;
};

/** Libellé du type de rapport → titre lisible. Un type inconnu retombe sur un
 *  intitulé générique plutôt que d'afficher une clé technique à l'utilisateur. */
const REPORT_TYPE_LABELS: Record<string, string> = {
  comparative_sites: 'Rapport comparatif entre sites',
  periodic_secaa: 'Rapport périodique SECAA',
  single_site: 'Rapport de site',
};

const titreDuRapport = (reportType: string): string =>
  REPORT_TYPE_LABELS[reportType] ?? 'Rapport analytique';

/**
 * Carte d'un rapport déclenché pendant le tour, ancrée sous la réponse.
 *
 * C'est la pièce qui supprime la rupture de contexte : `generate_report` est
 * asynchrone et ne renvoyait qu'un identifiant invisible côté client, si bien
 * qu'il fallait quitter la conversation pour lire le rapport. La carte suit la
 * génération en direct (polling arrêté sur statut terminal) et ouvre l'aperçu
 * dans le panneau latéral, sans navigation.
 *
 * PERMISSIONS : déclencher un rapport (`ai-reports:generate`) et le LIRE
 * (`ai-reports:view`) sont deux droits distincts. Sans le second, la carte
 * affiche l'état mais n'offre pas d'aperçu — un 403 brut à l'ouverture serait
 * incompréhensible.
 */
export function ReportArtifactCard({ artifact }: ReportArtifactCardProps) {
  const ouvrirRapport = useDocumentPanelStore((etat) => etat.ouvrirRapport);
  const openReportId = useOpenReportId();

  const { data: report } = useReportPolling(artifact.report_id);

  const statut = report?.status ?? artifact.status;
  const estOuvert = openReportId === artifact.report_id;
  const enCours = statut === REPORT_STATUS.PENDING;
  const enEchec = statut === REPORT_STATUS.FAILED;

  const titre = titreDuRapport(report?.report_type ?? artifact.report_type);

  const contenu = (
    <>
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-md border',
          enEchec
            ? 'border-destructive/30 bg-destructive/10 text-destructive'
            : 'bg-primary/10 border-border text-primary',
        )}
        aria-hidden
      >
        {enCours ? (
          <Loader2 className="size-4 animate-spin" />
        ) : enEchec ? (
          <AlertTriangle className="size-4" />
        ) : (
          <FileText className="size-4" />
        )}
      </span>
      <span className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-medium">{titre}</span>
        <span className="mt-1 flex flex-wrap items-center gap-1.5">
          <ReportStatusBadge status={statut} />
          <span className="text-xs text-muted-foreground">
            #{artifact.report_id}
          </span>
        </span>
      </span>
    </>
  );

  return (
    <Can
      permission="ai-reports:view"
      fallback={
        // Sans droit de lecture : on informe de l'avancement, sans promettre une
        // ouverture qui échouerait.
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5">
          {contenu}
          <span className="shrink-0 text-xs text-muted-foreground">
            Lecture réservée au demandeur et aux approbateurs
          </span>
        </div>
      }
    >
      <button
        type="button"
        onClick={() => ouvrirRapport(artifact.report_id)}
        aria-expanded={estOuvert}
        // `aria-controls` seulement quand la cible existe : panneau fermé,
        // l'élément n'est pas monté, et pointer un id absent laisse les
        // lecteurs d'écran dans un état indéfini.
        {...(estOuvert ? { 'aria-controls': 'panneau-document' } : {})}
        className={cn(
          'flex w-full items-center gap-3 rounded-lg border bg-card px-3 py-2.5 text-left shadow-sm',
          'transition-colors hover:border-primary focus-visible:border-primary',
          estOuvert ? 'border-primary ring-primary/20 ring-2' : 'border-border',
        )}
      >
        {contenu}
        <span className="shrink-0 text-xs font-medium text-primary">
          {estOuvert ? 'Ouvert' : enCours ? 'Suivre' : "Ouvrir l'aperçu"}
        </span>
      </button>
    </Can>
  );
}
