'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  ChevronRight,
  Inbox,
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
import { cn } from '@/lib/utils';

import { useChannelMessages } from '../api/get-messages';
import {
  CHANNELS,
  CHANNEL_LABELS,
  FILTERABLE_STATUSES,
  type ChannelMessage,
} from '../types';

import { MessageStatusBadge } from './message-status-badge';

const ITEMS_PER_PAGE = 20;
const DEBOUNCE_MS = 300;

const selectClass =
  'focus:ring-ring/50 flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus:border-ring focus:ring';

/**
 * Journal des messages des canaux de l'assistant.
 *
 * Remplace la liste plate de 50 entrées qui ne permettait ni de filtrer ni de
 * paginer : répondre à « qui ? » ou « par quel canal ? » supposait de tout
 * faire défiler, et un échec passait inaperçu au milieu du reste.
 */
export function MessagesLog() {
  const [page, setPage] = useState(1);
  const [channel, setChannel] = useState('');
  const [direction, setDirection] = useState('');
  const [statut, setStatut] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, DEBOUNCE_MS);
  };

  const { data, isLoading, isError, refetch, isFetching } = useChannelMessages({
    limit: ITEMS_PER_PAGE,
    offset: (page - 1) * ITEMS_PER_PAGE,
    ...(channel && { channel: channel as (typeof CHANNELS)[number] }),
    ...(direction && { direction: direction as 'in' | 'out' }),
    ...(statut && { status: statut }),
    ...(dateFrom && { date_from: dateFrom }),
    ...(dateTo && { date_to: dateTo }),
    ...(debouncedSearch && { search: debouncedSearch }),
  });

  const totalPages = data ? Math.ceil(data.count / ITEMS_PER_PAGE) : 1;
  const hasFilters =
    !!channel ||
    !!direction ||
    !!statut ||
    !!dateFrom ||
    !!dateTo ||
    !!debouncedSearch;

  const resetFilters = () => {
    setChannel('');
    setDirection('');
    setStatut('');
    setDateFrom('');
    setDateTo('');
    setSearchInput('');
    setDebouncedSearch('');
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-lg border bg-card p-3 lg:flex-row lg:flex-wrap lg:items-end">
        <div className="flex flex-col gap-1">
          <label
            htmlFor="journal-canal"
            className="text-xs text-muted-foreground"
          >
            Canal
          </label>
          <select
            id="journal-canal"
            value={channel}
            onChange={(e) => {
              setChannel(e.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">Tous les canaux</option>
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {CHANNEL_LABELS[c]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="journal-sens"
            className="text-xs text-muted-foreground"
          >
            Sens
          </label>
          <select
            id="journal-sens"
            value={direction}
            onChange={(e) => {
              setDirection(e.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">Reçus et envoyés</option>
            <option value="in">Reçus</option>
            <option value="out">Envoyés</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="journal-statut"
            className="text-xs text-muted-foreground"
          >
            Statut
          </label>
          <select
            id="journal-statut"
            value={statut}
            onChange={(e) => {
              setStatut(e.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">Tous les statuts</option>
            {FILTERABLE_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="journal-du" className="text-xs text-muted-foreground">
            Du
          </label>
          <Input
            id="journal-du"
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
          <label htmlFor="journal-au" className="text-xs text-muted-foreground">
            Au
          </label>
          <Input
            id="journal-au"
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
            htmlFor="journal-recherche"
            className="text-xs text-muted-foreground"
          >
            Recherche
          </label>
          <Input
            id="journal-recherche"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Numéro, adresse ou contenu du message"
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
          /* Un échec réseau tombait auparavant dans la branche « aucun
             message » : sur un journal d'incident, c'est le pire rendu
             possible — il laisse croire que tout va bien. */
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
            <Inbox
              className="size-8 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="text-sm text-muted-foreground">
              {hasFilters
                ? 'Aucun message ne correspond à ces filtres.'
                : 'Aucun message. Écrivez au numéro WhatsApp du centre pour démarrer une conversation.'}
            </p>
          </div>
        ) : (
          <>
            <TableElement>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead className="w-10">Sens</TableHead>
                  <TableHead>Quand</TableHead>
                  <TableHead>Canal</TableHead>
                  <TableHead>Interlocuteur</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Message</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.results.map((message) => {
                  const key = `${message.direction}-${message.id}`;
                  return (
                    <MessageRow
                      key={key}
                      message={message}
                      expanded={expandedKey === key}
                      onToggle={() =>
                        setExpandedKey(expandedKey === key ? null : key)
                      }
                    />
                  );
                })}
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
          {data.count} message{data.count > 1 ? 's' : ''} au total
        </p>
      )}
    </div>
  );
}

function MessageRow({
  message,
  expanded,
  onToggle,
}: {
  message: ChannelMessage;
  expanded: boolean;
  onToggle: () => void;
}) {
  const enEchec = message.status === 'failed' || message.status === 'rejected';

  return (
    <>
      <TableRow className={cn(enEchec && 'bg-destructive/5')}>
        <TableCell>
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onToggle}
            aria-label={
              expanded
                ? 'Masquer le message complet'
                : 'Voir le message complet'
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
        <TableCell>
          {message.direction === 'in' ? (
            <ArrowDownLeft className="size-4 text-primary" aria-hidden="true" />
          ) : (
            <ArrowUpRight
              className="size-4 text-muted-foreground"
              aria-hidden="true"
            />
          )}
          {/* L'icône seule n'est pas lisible par un lecteur d'écran. */}
          <span className="sr-only">
            {message.direction === 'in' ? 'Reçu' : 'Envoyé'}
          </span>
        </TableCell>
        <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
          {format(new Date(message.created_at), 'dd MMM yyyy HH:mm', {
            locale: fr,
          })}
        </TableCell>
        <TableCell>
          <Badge variant="outline">{CHANNEL_LABELS[message.channel]}</Badge>
        </TableCell>
        <TableCell className="font-mono text-xs">{message.peer}</TableCell>
        <TableCell>
          <MessageStatusBadge
            status={message.status}
            direction={message.direction}
          />
        </TableCell>
        <TableCell className="max-w-md">
          <span className="block truncate text-sm">{message.body}</span>
          {/* Le motif d'échec est visible SANS déplier : sinon il faudrait
              ouvrir chaque ligne pour découvrir qu'un envoi a raté. */}
          {message.error_message && (
            <span className="block truncate font-mono text-xs text-destructive">
              {message.error_message}
            </span>
          )}
        </TableCell>
      </TableRow>

      {expanded && (
        <TableRow>
          <TableCell colSpan={7} className="bg-muted/40">
            <div className="space-y-3">
              <div>
                <p className="mb-1 text-xs font-medium text-muted-foreground">
                  Message complet
                </p>
                <p className="whitespace-pre-wrap text-sm">{message.body}</p>
              </div>
              {message.error_message && (
                <div>
                  <p className="mb-1 text-xs font-medium text-muted-foreground">
                    Erreur du fournisseur
                  </p>
                  <p className="font-mono text-xs text-destructive">
                    {message.error_message}
                  </p>
                </div>
              )}
              {message.status === 'queued' && (
                <p className="text-xs text-muted-foreground">
                  Le fournisseur a accepté ce message, mais sa remise n&apos;est
                  pas confirmée.
                </p>
              )}
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}
