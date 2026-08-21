'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BookOpen, TriangleAlert } from 'lucide-react';
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

import { useInsights } from '../api/get-insights';

const ITEMS_PER_PAGE = 20;

const selectClass =
  'focus:ring-ring/50 flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus:border-ring focus:ring';

/**
 * Tableau des règles enregistrées.
 *
 * Subtilité critique : `is_retracted` détermine si une règle est encore en vigueur,
 * PAS le champ `active`. Une règle peut avoir `active: true` côté backend mais
 * être retirée (`is_retracted: true` sur la proposition qui l'a créée).
 * L'API /insights/ expose directement `active` qui tient compte du retrait —
 * on s'y fie directement ici, sans recroiser `is_retracted` (non exposé sur cet endpoint).
 */
export function InsightsTable() {
  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState<'' | 'true' | 'false'>('');

  const params = {
    limit: ITEMS_PER_PAGE,
    offset: (page - 1) * ITEMS_PER_PAGE,
    ...(activeFilter !== '' ? { active: activeFilter === 'true' } : {}),
  };

  const { data, isLoading, isError, refetch, isFetching } = useInsights(params);

  const totalPages = data ? Math.ceil(data.count / ITEMS_PER_PAGE) : 1;

  return (
    <div className="space-y-4">
      {/* Filtre actif/retiré */}
      <div className="flex flex-wrap items-end gap-3 rounded-lg border bg-card p-3">
        <label className="flex flex-col gap-1 text-xs text-muted-foreground">
          État
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value as '' | 'true' | 'false');
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">Toutes les règles</option>
            <option value="true">En vigueur</option>
            <option value="false">Retirées</option>
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
              <p className="font-medium">Impossible de charger les règles</p>
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
            <BookOpen className="size-8 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">
              {activeFilter !== ''
                ? 'Aucune règle pour ce filtre.'
                : "Aucune règle enregistrée pour l'instant."}
            </p>
          </div>
        ) : (
          <>
            <TableElement>
              <TableHeader>
                <TableRow>
                  <TableHead>État</TableHead>
                  <TableHead>Règle</TableHead>
                  <TableHead>Appliquée le</TableHead>
                  <TableHead>Par</TableHead>
                  <TableHead>Confirmations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.results.map((insight) => (
                  <TableRow key={insight.id}>
                    <TableCell>
                      {insight.active ? (
                        <Badge variant="default">En vigueur</Badge>
                      ) : (
                        <Badge variant="outline">Retirée</Badge>
                      )}
                    </TableCell>
                    <TableCell className="max-w-lg">
                      <p className="text-sm">{insight.text}</p>
                      {!insight.active && insight.retraction_reason && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Motif du retrait : {insight.retraction_reason}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {insight.applied_at
                        ? format(new Date(insight.applied_at), 'dd MMM yyyy', {
                            locale: fr,
                          })
                        : '—'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {insight.applied_by_email ?? '—'}
                    </TableCell>
                    <TableCell className="text-sm tabular-nums">
                      {insight.reaffirm_count > 0 ? (
                        <Badge variant="secondary">
                          {insight.reaffirm_count}×
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
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
          {data.count} règle{data.count > 1 ? 's' : ''} au total
        </p>
      )}
    </div>
  );
}
