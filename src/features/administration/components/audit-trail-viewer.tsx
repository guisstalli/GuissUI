'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ChevronDown,
  ChevronRight,
  EyeOff,
  FileClock,
  TriangleAlert,
} from 'lucide-react';
import { useRef, useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form/input';
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

import { useAuditedModels, useAuditTrail } from '../api/get-audit-trail';
import type { AuditTrailEntry } from '../types/schemas';

const ITEMS_PER_PAGE = 20;
const DEBOUNCE_MS = 300;

const selectClass =
  'focus:ring-ring/50 flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus:border-ring focus:ring';

/**
 * Codes auditlog. Le backend renvoie déjà le libellé dans `action` ; cette
 * table ne sert qu'à envoyer le bon code dans le filtre.
 */
const ACTIONS = [
  { code: 0, label: 'Création' },
  { code: 1, label: 'Modification' },
  { code: 2, label: 'Suppression' },
  { code: 3, label: 'Accès' },
] as const;

/**
 * Traduction du libellé d'action renvoyé par le serveur.
 *
 * Le commentaire ci-dessus affirmait que « le backend renvoie déjà le
 * libellé » — exact, mais django-auditlog produit des libellés ANGLAIS
 * (`create`, `update`…). La colonne affichait donc « update » juste sous un
 * filtre proposant « Modification » : traduit d'un côté, brut de l'autre.
 *
 * Repli sur la valeur reçue plutôt qu'un tiret : une action inconnue doit
 * rester lisible, pas disparaître.
 */
const ACTION_LABELS: Record<string, string> = {
  create: 'Création',
  update: 'Modification',
  delete: 'Suppression',
  access: 'Accès',
};

function actionLabel(action: string): string {
  return ACTION_LABELS[action.toLowerCase()] ?? action;
}

function actionVariant(action: string): 'default' | 'outline' | 'destructive' {
  if (action === 'delete') return 'destructive';
  if (action === 'create') return 'default';
  return 'outline';
}

/**
 * Journal des modifications.
 *
 * Distinct du journal de sécurité (`security-log-viewer`) : celui-ci répond à
 * « quelles VALEURS ont changé », l'autre à « qui a CONSULTÉ quoi ».
 */
export function AuditTrailViewer() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState('');
  const [modelKey, setModelKey] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, DEBOUNCE_MS);
  };

  const { data: models } = useAuditedModels();

  // `modelKey` porte « app_label.model » pour tenir dans un seul <select>.
  const [appLabel, model] = modelKey ? modelKey.split('.') : [];

  const { data, isLoading, isError, refetch, isFetching } = useAuditTrail({
    limit: ITEMS_PER_PAGE,
    offset: (page - 1) * ITEMS_PER_PAGE,
    ...(action && { action: Number(action) }),
    ...(appLabel && { app_label: appLabel }),
    ...(model && { model }),
    ...(dateFrom && { date_from: dateFrom }),
    ...(dateTo && { date_to: dateTo }),
    ...(debouncedSearch && { search: debouncedSearch }),
  });

  const totalPages = data ? Math.ceil(data.count / ITEMS_PER_PAGE) : 1;
  const hasFilters =
    !!action || !!modelKey || !!dateFrom || !!dateTo || !!debouncedSearch;

  const resetFilters = () => {
    setAction('');
    setModelKey('');
    setDateFrom('');
    setDateTo('');
    setSearchInput('');
    setDebouncedSearch('');
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 lg:flex-row lg:flex-wrap lg:items-end">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Action
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">Toutes les actions</option>
            {ACTIONS.map((a) => (
              <option key={a.code} value={a.code}>
                {a.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Type d&apos;objet
          <select
            value={modelKey}
            onChange={(e) => {
              setModelKey(e.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">Tous les types</option>
            {(models ?? []).map((m) => (
              <option
                key={`${m.app_label}.${m.model}`}
                value={`${m.app_label}.${m.model}`}
              >
                {m.label}
              </option>
            ))}
          </select>
        </label>

        {/* `htmlFor` + `id` plutôt qu'un simple encadrement : `Input` est un
            composant, et l'association implicite par imbrication n'est alors
            garantie ni pour l'outillage ni pour les lecteurs d'écran. */}
        <div className="flex flex-col gap-1">
          <label
            htmlFor="audit-date-from"
            className="text-xs text-muted-foreground"
          >
            Du
          </label>
          <Input
            id="audit-date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="h-9"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="audit-date-to"
            className="text-xs text-muted-foreground"
          >
            Au
          </label>
          <Input
            id="audit-date-to"
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            className="h-9"
          />
        </div>

        <div className="flex flex-1 flex-col gap-1">
          <label
            htmlFor="audit-search"
            className="text-xs text-muted-foreground"
          >
            Objet concerné
          </label>
          <Input
            id="audit-search"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Ex. Facture F-2026-014"
            className="h-9"
          />
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Réinitialiser
          </Button>
        )}
      </div>

      <div className="rounded-lg border">
        {isLoading ? (
          <div className="flex justify-center p-10">
            <Spinner />
          </div>
        ) : isError ? (
          /* Sans ce bloc, un échec réseau se présenterait comme un journal
             vide — le pire rendu possible pour un outil d'audit, puisqu'il
             laisse croire qu'aucune modification n'a eu lieu. */
          <div className="flex flex-col items-center gap-3 p-10 text-center">
            <TriangleAlert
              className="size-8 text-destructive"
              aria-hidden="true"
            />
            <div>
              <p className="font-medium">Impossible de charger le journal</p>
              <p className="text-sm text-muted-foreground">
                Ceci n&apos;est pas un journal vide : la requête a échoué.
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
            <FileClock
              className="size-8 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">
              {hasFilters
                ? 'Aucune modification ne correspond à ces filtres.'
                : 'Aucune modification enregistrée.'}
            </p>
          </div>
        ) : (
          <>
            <TableElement>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Quand</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Objet</TableHead>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Adresse IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.results.map((row) => (
                  <AuditRow
                    key={row.id}
                    row={row}
                    expanded={expandedId === row.id}
                    onToggle={() =>
                      setExpandedId(expandedId === row.id ? null : row.id)
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
          {data.count} modification{data.count > 1 ? 's' : ''} au total
        </p>
      )}
    </div>
  );
}

function AuditRow({
  row,
  expanded,
  onToggle,
}: {
  row: AuditTrailEntry;
  expanded: boolean;
  onToggle: () => void;
}) {
  const champs = Object.entries(row.changes ?? {});
  const hasChanges = champs.length > 0;

  return (
    <>
      <TableRow>
        <TableCell>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onToggle}
            disabled={!hasChanges}
            aria-label={
              expanded
                ? 'Masquer les champs modifiés'
                : 'Voir les champs modifiés'
            }
            aria-expanded={expanded}
          >
            {expanded ? (
              <ChevronDown className="size-4" aria-hidden="true" />
            ) : (
              <ChevronRight className="size-4" aria-hidden="true" />
            )}
          </Button>
        </TableCell>
        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
          {format(new Date(row.timestamp), 'dd MMM yyyy HH:mm', { locale: fr })}
        </TableCell>
        <TableCell>
          <Badge variant={actionVariant(row.action)}>
            {actionLabel(row.action)}
          </Badge>
        </TableCell>
        <TableCell className="text-sm">
          <span className="font-medium">{row.object_repr || '—'}</span>
          <span className="block text-xs text-muted-foreground">
            {row.model_label}
          </span>
        </TableCell>
        <TableCell className="text-sm">{row.actor.label}</TableCell>
        <TableCell className="font-mono text-xs text-muted-foreground">
          {row.ip_address ?? '—'}
        </TableCell>
      </TableRow>

      {expanded && hasChanges && (
        <TableRow>
          <TableCell colSpan={6} className="bg-muted/40">
            {row.changes_redacted && (
              /* Sans cet avertissement, les points seraient lus comme la
                 valeur réellement enregistrée. */
              <p className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
                <EyeOff className="size-3.5 shrink-0" aria-hidden="true" />
                Valeurs masquées : cet objet porte des données de santé, que
                votre compte n&apos;est pas autorisé à consulter. Les champs
                modifiés restent exacts.
              </p>
            )}
            <dl className="grid gap-2">
              {champs.map(([champ, [avant, apres]]) => (
                <div
                  key={champ}
                  className="grid items-baseline gap-1 sm:grid-cols-[minmax(8rem,14rem)_1fr]"
                >
                  <dt className="font-mono text-xs text-muted-foreground">
                    {champ}
                  </dt>
                  <dd className="flex flex-wrap items-baseline gap-2 text-sm">
                    <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-destructive line-through">
                      {avant === '' || avant == null ? '∅' : String(avant)}
                    </span>
                    <span aria-hidden="true" className="text-muted-foreground">
                      →
                    </span>
                    <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-emerald-700 dark:text-emerald-400">
                      {apres === '' || apres == null ? '∅' : String(apres)}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
