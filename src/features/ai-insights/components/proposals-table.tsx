'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  Loader2,
  LockOpen,
  ShieldQuestion,
  TriangleAlert,
  Undo2,
  X,
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { TablePagination } from '@/components/ui/table/pagination';
import {
  TableBody,
  TableCell,
  TableElement,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table/table';

import { useApplyProposal } from '../api/apply-proposal';
import { useProposals } from '../api/get-proposals';
import { useQuarantineProposal } from '../api/quarantine-proposal';
import { useRejectProposal } from '../api/reject-proposal';
import { useRetractProposal } from '../api/retract-proposal';
import { PROPOSAL_STATUS, type Proposal, type ProposalStatus } from '../types';

import { ProposalOperationBadge } from './proposal-operation-badge';
import { ProposalStatusBadge } from './proposal-status-badge';
import { ReasonDialog } from './reason-dialog';

const ITEMS_PER_PAGE = 20;

const selectClass =
  'focus:ring-ring/50 flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus:border-ring focus:ring';

const STATUS_OPTIONS: { value: ProposalStatus | ''; label: string }[] = [
  { value: '', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'applied', label: 'Appliquées' },
  { value: 'rejected', label: 'Rejetées' },
  { value: 'quarantined', label: 'Quarantaine' },
  { value: 'stale', label: 'Périmées' },
];

/**
 * Tableau de review des propositions d'insights.
 *
 * Subtilités gérées :
 * 1. `target_stale` → bandeau d'avertissement affiché AVANT les boutons
 * 2. `is_retracted` → distingué du statut pour les règles appliquées retirées
 * 3. `operation edit/remove` → diff avant/après dans la ligne expansible
 * 4. 409 → message serveur affiché, liste rechargée
 */
export function ProposalsTable() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<ProposalStatus | ''>(
    'pending',
  );
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Dialogs d'action
  const [rejectTarget, setRejectTarget] = useState<Proposal | null>(null);
  const [quarantineTarget, setQuarantineTarget] = useState<Proposal | null>(
    null,
  );
  const [retractTarget, setRetractTarget] = useState<Proposal | null>(null);

  // Erreur 409 en ligne (apply / retract)
  const [inlineError, setInlineError] = useState<{
    proposalId: number;
    message: string;
  } | null>(null);

  const params = {
    limit: ITEMS_PER_PAGE,
    offset: (page - 1) * ITEMS_PER_PAGE,
    ...(statusFilter ? { status: statusFilter } : {}),
  };

  const { data, isLoading, isError, refetch, isFetching } =
    useProposals(params);

  const applyMutation = useApplyProposal({
    onSuccess: () => setInlineError(null),
    onError: (error) => {
      // Un 409 n'est pas une panne — c'est une info métier
      setInlineError({
        proposalId: applyMutation.variables ?? 0,
        message: error.message,
      });
      // Recharger la proposition pour avoir son état à jour
      refetch();
    },
  });

  const rejectMutation = useRejectProposal({
    onSuccess: () => setRejectTarget(null),
  });

  const quarantineMutation = useQuarantineProposal({
    onSuccess: () => setQuarantineTarget(null),
  });

  const retractMutation = useRetractProposal({
    onSuccess: () => setRetractTarget(null),
    onError: (error) => {
      setInlineError({
        proposalId: retractTarget?.id ?? 0,
        message: error.message,
      });
      setRetractTarget(null);
      refetch();
    },
  });

  const totalPages = data ? Math.ceil(data.count / ITEMS_PER_PAGE) : 1;

  return (
    <div className="space-y-4">
      {/* Filtre de statut */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-3">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Statut
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as ProposalStatus | '');
              setPage(1);
            }}
            className={selectClass}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="rounded-lg border">
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Spinner />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <TriangleAlert className="size-8 text-destructive" aria-hidden />
            <div>
              <p className="font-medium">
                Impossible de charger les propositions
              </p>
              <p className="text-sm text-muted-foreground">
                Ceci n&apos;est pas une liste vide : la requête a échoué.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isFetching}
            >
              Réessayer
            </Button>
          </div>
        ) : !data || data.results.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center">
            <Lightbulb className="size-8 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">
              Aucune proposition{statusFilter ? ' pour ce statut' : ''}.
            </p>
          </div>
        ) : (
          <>
            <TableElement>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Date</TableHead>
                  <TableHead>Opération</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Texte proposé</TableHead>
                  <TableHead>Sources</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.results.map((proposal) => (
                  <ProposalRow
                    key={proposal.id}
                    proposal={proposal}
                    expanded={expandedId === proposal.id}
                    inlineError={
                      inlineError?.proposalId === proposal.id
                        ? inlineError.message
                        : null
                    }
                    onToggle={() =>
                      setExpandedId(
                        expandedId === proposal.id ? null : proposal.id,
                      )
                    }
                    onApply={() => {
                      setInlineError(null);
                      applyMutation.mutate(proposal.id);
                    }}
                    onReject={() => setRejectTarget(proposal)}
                    onQuarantine={() => setQuarantineTarget(proposal)}
                    onRetract={() => setRetractTarget(proposal)}
                    isApplying={
                      applyMutation.isPending &&
                      applyMutation.variables === proposal.id
                    }
                  />
                ))}
              </TableBody>
            </TableElement>

            {totalPages > 1 && (
              <TablePagination
                totalPages={totalPages}
                currentPage={page}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>

      {data && !isError && (
        <p className="text-xs text-muted-foreground">
          {data.count} proposition{data.count > 1 ? 's' : ''} au total
        </p>
      )}

      {/* Dialogue de rejet */}
      <ReasonDialog
        open={rejectTarget !== null}
        onOpenChange={(open) => !open && setRejectTarget(null)}
        title="Rejeter la proposition"
        description="Le motif est conservé dans l'historique. Il est affiché dans le journal de l'agent."
        submitLabel="Rejeter"
        submitVariant="destructive"
        isPending={rejectMutation.isPending}
        isError={rejectMutation.isError}
        errorMessage={
          rejectMutation.error instanceof Error
            ? rejectMutation.error.message
            : undefined
        }
        onSubmit={(reason) =>
          rejectTarget && rejectMutation.mutate({ id: rejectTarget.id, reason })
        }
      />

      {/* Dialogue de quarantaine */}
      <ReasonDialog
        open={quarantineTarget !== null}
        onOpenChange={(open) => !open && setQuarantineTarget(null)}
        title="Mettre en quarantaine"
        description="La proposition est suspendue — ni appliquée ni définitivement rejetée. Motif obligatoire."
        submitLabel="Mettre en quarantaine"
        submitVariant="default"
        isPending={quarantineMutation.isPending}
        isError={quarantineMutation.isError}
        errorMessage={
          quarantineMutation.error instanceof Error
            ? quarantineMutation.error.message
            : undefined
        }
        onSubmit={(reason) =>
          quarantineTarget &&
          quarantineMutation.mutate({ id: quarantineTarget.id, reason })
        }
      />

      {/* Dialogue de retrait */}
      <ReasonDialog
        open={retractTarget !== null}
        onOpenChange={(open) => !open && setRetractTarget(null)}
        title="Retirer la règle appliquée"
        description="La règle ne sera plus en vigueur. Le motif est facultatif."
        submitLabel="Retirer"
        submitVariant="destructive"
        isPending={retractMutation.isPending}
        isError={retractMutation.isError}
        errorMessage={
          retractMutation.error instanceof Error
            ? retractMutation.error.message
            : undefined
        }
        onSubmit={(reason) =>
          retractTarget &&
          retractMutation.mutate({
            id: retractTarget.id,
            reason: reason || undefined,
          })
        }
      />
    </div>
  );
}

// =============================================================================
// Ligne de proposition
// =============================================================================

interface ProposalRowProps {
  proposal: Proposal;
  expanded: boolean;
  inlineError: string | null;
  onToggle: () => void;
  onApply: () => void;
  onReject: () => void;
  onQuarantine: () => void;
  onRetract: () => void;
  isApplying: boolean;
}

function ProposalRow({
  proposal,
  expanded,
  inlineError,
  onToggle,
  onApply,
  onReject,
  onQuarantine,
  onRetract,
  isApplying,
}: ProposalRowProps) {
  const isPending = proposal.status === PROPOSAL_STATUS.PENDING;
  const isApplied = proposal.status === PROPOSAL_STATUS.APPLIED;
  const isRetractable = isApplied && !proposal.is_retracted;
  const isRetracted = isApplied && proposal.is_retracted;

  /** La cible a bougé : l'application échouera en 409 */
  const staleWarning = proposal.target_stale;

  /** Les opérations edit/remove ont un avant/après à montrer */
  const hasDiff =
    (proposal.operation === 'edit' || proposal.operation === 'remove') &&
    proposal.target_text !== null;

  return (
    <>
      <TableRow>
        {/* Expand toggle */}
        <TableCell>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={expanded ? 'Masquer les détails' : 'Voir les détails'}
          >
            {expanded ? (
              <ChevronDown className="size-4" aria-hidden />
            ) : (
              <ChevronRight className="size-4" aria-hidden />
            )}
          </Button>
        </TableCell>

        {/* Date */}
        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
          {format(new Date(proposal.created_at), 'dd MMM yyyy', { locale: fr })}
        </TableCell>

        {/* Opération */}
        <TableCell>
          <ProposalOperationBadge operation={proposal.operation} />
        </TableCell>

        {/* Statut — « applied » + is_retracted → badge "Retirée" */}
        <TableCell>
          {isRetracted ? (
            <Badge variant="outline">Retirée</Badge>
          ) : (
            <ProposalStatusBadge status={proposal.status} />
          )}
        </TableCell>

        {/* Texte proposé (preview) + avertissement cible périmée AVANT les actions */}
        <TableCell className="max-w-xs">
          <div className="space-y-1">
            {staleWarning && (
              <div
                className="flex items-center gap-1 rounded border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-800 dark:border-amber-600 dark:bg-amber-950 dark:text-amber-300"
                role="alert"
                aria-label="Cible modifiée — l'application échouera"
              >
                <AlertTriangle className="size-3 shrink-0" aria-hidden />
                Cible modifiée depuis la proposition
              </div>
            )}
            <p className="line-clamp-2 text-sm">
              {proposal.proposed_text || (
                <span className="italic text-muted-foreground">
                  (suppression de la règle cible)
                </span>
              )}
            </p>
          </div>
        </TableCell>

        {/* Sources */}
        <TableCell>
          {proposal.source_experience_ids.length > 0 ? (
            <Badge variant="outline" className="font-mono text-xs">
              {proposal.source_experience_ids.length} exp.
            </Badge>
          ) : (
            <span className="text-xs text-muted-foreground">—</span>
          )}
        </TableCell>

        {/* Actions */}
        <TableCell className="text-right">
          <div className="flex items-center justify-end gap-2">
            {isPending && (
              <>
                {!staleWarning && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={onApply}
                    disabled={isApplying}
                    aria-label="Appliquer la proposition"
                  >
                    {isApplying ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden />
                    ) : (
                      <LockOpen className="size-4" aria-hidden />
                    )}
                    <span className="ml-1.5">Appliquer</span>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onQuarantine}
                  aria-label="Mettre en quarantaine"
                >
                  <ShieldQuestion className="size-4" aria-hidden />
                  <span className="ml-1.5">Quarantaine</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onReject}
                  aria-label="Rejeter la proposition"
                >
                  <X className="size-4" aria-hidden />
                  <span className="ml-1.5">Rejeter</span>
                </Button>
              </>
            )}

            {isRetractable && (
              <Button
                size="sm"
                variant="destructive"
                onClick={onRetract}
                aria-label="Retirer la règle appliquée"
              >
                <Undo2 className="size-4" aria-hidden />
                <span className="ml-1.5">Retirer</span>
              </Button>
            )}
          </div>

          {/* Erreur 409 inline sous les boutons */}
          {inlineError && (
            <p
              className="mt-1 text-right text-xs text-destructive"
              role="alert"
            >
              {inlineError}
            </p>
          )}
        </TableCell>
      </TableRow>

      {/* Ligne expansible : détails, rationale, diff avant/après */}
      {expanded && (
        <TableRow>
          <TableCell colSpan={7} className="bg-muted/40 px-6 py-4">
            <div className="space-y-4">
              {/* Raisonnement de l'agent */}
              {proposal.rationale && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Raisonnement de l&apos;agent
                  </p>
                  <p className="text-sm">{proposal.rationale}</p>
                </div>
              )}

              {/* Diff avant/après pour edit et remove */}
              {hasDiff && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Impact sur la règle cible
                  </p>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-xs text-muted-foreground">
                        Texte actuel
                      </dt>
                      <dd className="bg-destructive/10 mt-0.5 rounded px-2 py-1.5 text-sm text-destructive line-through">
                        {proposal.target_text}
                      </dd>
                    </div>
                    {proposal.proposed_text && (
                      <div>
                        <dt className="text-xs text-muted-foreground">
                          Texte proposé
                        </dt>
                        <dd className="mt-0.5 rounded bg-emerald-500/10 px-2 py-1.5 text-sm text-emerald-700 dark:text-emerald-400">
                          {proposal.proposed_text}
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}

              {/* Sources d'expériences */}
              {proposal.source_experience_ids.length > 0 && (
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Basée sur{' '}
                    {proposal.source_experience_ids.length === 1
                      ? '1 expérience'
                      : `${proposal.source_experience_ids.length} expériences`}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {proposal.source_experience_ids.map((expId) => (
                      <Badge
                        key={expId}
                        variant="outline"
                        className="font-mono text-xs"
                      >
                        #{expId}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Revue précédente */}
              {proposal.reviewed_at && (
                <div className="text-xs text-muted-foreground">
                  Examinée le{' '}
                  {format(new Date(proposal.reviewed_at), 'dd MMM yyyy HH:mm', {
                    locale: fr,
                  })}{' '}
                  par {proposal.reviewed_by_email ?? '—'}
                  {proposal.review_reason && ` — ${proposal.review_reason}`}
                </div>
              )}

              {/* Retrait */}
              {proposal.is_retracted && proposal.retracted_at && (
                <div className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs dark:border-amber-600 dark:bg-amber-950">
                  Règle retirée le{' '}
                  {format(
                    new Date(proposal.retracted_at),
                    'dd MMM yyyy HH:mm',
                    {
                      locale: fr,
                    },
                  )}{' '}
                  par {proposal.retracted_by_email ?? '—'}
                </div>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
