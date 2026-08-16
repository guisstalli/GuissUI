'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronDown, ChevronRight, ShieldQuestion } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

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

import { useSecurityAudit } from '../api/get-security-audit';
import type { SecurityAuditEvent } from '../types/schemas';

const ITEMS_PER_PAGE = 20;
const DEBOUNCE_MS = 300;

const selectClass =
  'focus:ring-ring/50 flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus:border-ring focus:ring';

export function SecurityLogViewer() {
  const [page, setPage] = useState(1);
  const [event, setEvent] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [userIdInput, setUserIdInput] = useState('');
  const [ipInput, setIpInput] = useState('');
  const [debouncedUserId, setDebouncedUserId] = useState('');
  const [debouncedIp, setDebouncedIp] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Le journal n'expose pas de registre d'événements : on accumule les couples
  // event / event_display rencontrés pour alimenter le menu déroulant.
  const [eventOptions, setEventOptions] = useState<Record<string, string>>({});

  const userIdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleUserIdChange = (value: string) => {
    setUserIdInput(value);
    if (userIdTimer.current) clearTimeout(userIdTimer.current);
    userIdTimer.current = setTimeout(() => {
      setDebouncedUserId(value);
      setPage(1);
    }, DEBOUNCE_MS);
  };

  const handleIpChange = (value: string) => {
    setIpInput(value);
    if (ipTimer.current) clearTimeout(ipTimer.current);
    ipTimer.current = setTimeout(() => {
      setDebouncedIp(value);
      setPage(1);
    }, DEBOUNCE_MS);
  };

  const offset = (page - 1) * ITEMS_PER_PAGE;
  const userIdNumber = Number(debouncedUserId);

  const params = {
    limit: ITEMS_PER_PAGE,
    offset,
    ...(event && { event }),
    ...(dateFrom && { date_from: dateFrom }),
    ...(dateTo && { date_to: dateTo }),
    ...(debouncedUserId && Number.isFinite(userIdNumber) && userIdNumber > 0
      ? { user_id: userIdNumber }
      : {}),
    ...(debouncedIp && { ip: debouncedIp }),
  };

  const { data, isLoading, isError, refetch } = useSecurityAudit(params);

  useEffect(() => {
    if (!data?.results) return;
    setEventOptions((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const row of data.results) {
        if (row.event && !(row.event in next)) {
          next[row.event] = row.event_display || row.event;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [data?.results]);

  const totalPages = data ? Math.ceil(data.count / ITEMS_PER_PAGE) : 1;
  const hasFilters =
    !!event || !!dateFrom || !!dateTo || !!debouncedUserId || !!debouncedIp;

  const sortedEventOptions = useMemo(
    () => Object.entries(eventOptions).sort((a, b) => a[1].localeCompare(b[1])),
    [eventOptions],
  );

  const resetFilters = () => {
    setEvent('');
    setDateFrom('');
    setDateTo('');
    setUserIdInput('');
    setIpInput('');
    setDebouncedUserId('');
    setDebouncedIp('');
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 lg:flex-row lg:flex-wrap lg:items-end">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          Type d&apos;événement
          <select
            value={event}
            onChange={(e) => {
              setEvent(e.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">Tous les événements</option>
            {sortedEventOptions.map(([code, label]) => (
              <option key={code} value={code}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <label htmlFor="security-filter-date-from">Du</label>
          <Input
            id="security-filter-date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => {
              setDateFrom(e.target.value);
              setPage(1);
            }}
            className="w-40"
          />
        </div>

        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <label htmlFor="security-filter-date-to">Au</label>
          <Input
            id="security-filter-date-to"
            type="date"
            value={dateTo}
            onChange={(e) => {
              setDateTo(e.target.value);
              setPage(1);
            }}
            className="w-40"
          />
        </div>

        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <label htmlFor="security-filter-user-id">ID utilisateur</label>
          <Input
            id="security-filter-user-id"
            type="number"
            min={1}
            placeholder="ex. 42"
            value={userIdInput}
            onChange={(e) => handleUserIdChange(e.target.value)}
            className="w-32"
          />
        </div>

        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <label htmlFor="security-filter-ip">Adresse IP</label>
          <Input
            id="security-filter-ip"
            placeholder="ex. 41.82.0.1"
            value={ipInput}
            onChange={(e) => handleIpChange(e.target.value)}
            className="w-40"
          />
        </div>

        {hasFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Tableau */}
      <div className="rounded-lg border bg-card">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : isError ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            <ShieldQuestion className="size-10 text-destructive" />
            <p className="text-sm">
              Impossible de charger le journal de sécurité.
            </p>
            <Button variant="ghost" size="sm" onClick={() => refetch()}>
              Réessayer
            </Button>
          </div>
        ) : !data || data.results.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
            <ShieldQuestion className="size-10" />
            <p className="text-sm">Aucun événement trouvé</p>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={resetFilters}>
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        ) : (
          <>
            <TableElement className="bg-card">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Date</TableHead>
                  <TableHead>Événement</TableHead>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Adresse IP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.results.map((row) => (
                  <SecurityRow
                    key={row.id}
                    row={row}
                    expanded={expandedId === row.id}
                    onToggle={() =>
                      setExpandedId((prev) => (prev === row.id ? null : row.id))
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

      {data && (
        <p className="text-xs text-muted-foreground">
          {data.count} événement{data.count > 1 ? 's' : ''} au total
        </p>
      )}
    </div>
  );
}

function SecurityRow({
  row,
  expanded,
  onToggle,
}: {
  row: SecurityAuditEvent;
  expanded: boolean;
  onToggle: () => void;
}) {
  const hasMetadata = row.metadata && Object.keys(row.metadata).length > 0;

  return (
    <>
      <TableRow>
        <TableCell>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onToggle}
            disabled={!hasMetadata}
            aria-label={expanded ? 'Masquer les détails' : 'Voir les détails'}
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
          {format(new Date(row.created_at), 'dd MMM yyyy HH:mm', {
            locale: fr,
          })}
        </TableCell>
        <TableCell>
          <Badge variant="outline">{row.event_display || row.event}</Badge>
        </TableCell>
        <TableCell className="text-sm">{row.user_email ?? '—'}</TableCell>
        <TableCell className="font-mono text-xs text-muted-foreground">
          {row.ip_address ?? '—'}
        </TableCell>
      </TableRow>
      {expanded && hasMetadata && (
        <TableRow>
          <TableCell colSpan={5} className="bg-muted/40">
            <pre className="max-h-64 overflow-auto rounded-md bg-background p-3 text-xs">
              {JSON.stringify(row.metadata, null, 2)}
            </pre>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
