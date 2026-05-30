'use client';

import {
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { AppShell as Shell } from '@/app/_shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form';
import {
  TableBody,
  TableCell,
  TableElement as Table,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { KpiCard } from '@/features/dashboard/components/kpi-card';
import { useAdultExams } from '@/features/exams/api/adult/get-adult-exams';
import type { ExamsQueryParams } from '@/features/exams/types';
import { useSites } from '@/features/sites/api/get-sites';

const ITEMS_PER_PAGE = 10;

export default function ConducteursExamensPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [siteId, setSiteId] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: sitesData } = useSites({ params: { limit: 100 } });

  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      if (searchQuery !== debouncedSearch) setCurrentPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchQuery, debouncedSearch]);

  const queryParams: ExamsQueryParams = {
    is_driver: true,
    limit: ITEMS_PER_PAGE,
    offset: (currentPage - 1) * ITEMS_PER_PAGE,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(statusFilter === 'complete' && { is_completed: true }),
    ...(statusFilter === 'in-progress' && { is_completed: false }),
    ...(siteId !== undefined && { site: siteId }),
    ordering: '-created',
  };

  const { data, isLoading, isError, refetch } = useAdultExams({
    params: queryParams,
  });

  // KPI queries — same pattern as adult exam list
  const { data: allData } = useAdultExams({
    params: { is_driver: true, limit: 1, offset: 0 },
  });
  const { data: completedData } = useAdultExams({
    params: { is_driver: true, limit: 1, offset: 0, is_completed: true },
  });

  const exams = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const totalExams = allData?.count ?? 0;
  const completedExams = completedData?.count ?? 0;
  const inProgressExams = totalExams - completedExams;

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  return (
    <Shell title="Examens conducteurs">
      {/* KPI Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          title="Total examens"
          value={totalExams}
          subtitle="conducteurs dépistés"
          icon={ClipboardList}
        />
        <KpiCard
          title="Complétés"
          value={completedExams}
          subtitle={
            totalExams > 0
              ? `${Math.round((completedExams / totalExams) * 100)}% du total`
              : '—'
          }
          icon={CheckCircle2}
          className="border-emerald-200 dark:border-emerald-900/40"
        />
        <KpiCard
          title="En cours"
          value={inProgressExams}
          subtitle="examens non finalisés"
          icon={Clock}
          className="border-amber-200 dark:border-amber-900/40"
        />
      </div>

      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Rechercher par conducteur ou numéro d'examen..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Rechercher des examens"
          />
        </div>

        <Select value={statusFilter} onValueChange={handleStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="complete">Complété</SelectItem>
            <SelectItem value="in-progress">En cours</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={siteId !== undefined ? String(siteId) : 'all'}
          onValueChange={(v) => {
            setSiteId(v === 'all' ? undefined : Number(v));
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Tous les sites" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les sites</SelectItem>
            {(sitesData?.results ?? []).map((s) => (
              <SelectItem key={s.id} value={String(s.id)}>
                {s.libelle}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="icon"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw
            className={`size-4 ${isLoading ? 'animate-spin' : ''}`}
            aria-hidden="true"
          />
          <span className="sr-only">Rafraîchir</span>
        </Button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <p className="text-destructive">
            Erreur lors du chargement des examens
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Réessayer
          </Button>
        </div>
      )}

      {!isLoading && !isError && (
        <>
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <Table className="bg-card">
              <TableHeader>
                <TableRow>
                  <TableHead>N° Examen</TableHead>
                  <TableHead>Conducteur</TableHead>
                  <TableHead className="hidden sm:table-cell">Site</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Dernière mise à jour
                  </TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Aucun examen de conducteur trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  exams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {exam.numero_examen}
                      </TableCell>
                      <TableCell className="font-medium">
                        {exam.patient_name}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                        {exam.site_libelle ?? '—'}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                        {new Date(exam.created).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        {exam.is_completed ? (
                          <Badge className="gap-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <Check className="size-3" />
                            Terminé
                          </Badge>
                        ) : (
                          <Badge
                            variant="secondary"
                            className="gap-1 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"
                          >
                            <Clock className="size-3" />
                            En cours
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden text-sm text-muted-foreground md:table-cell">
                        {new Date(exam.modified).toLocaleString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/exams/adult/${exam.id}`}>
                            {exam.is_completed ? 'Voir' : 'Continuer'}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Affichage de {exams.length} sur {totalCount} examens
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="mr-1 size-4" aria-hidden="true" />
                Précédent
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} sur {totalPages || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage >= totalPages}
              >
                Suivant
                <ChevronRight className="ml-1 size-4" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </>
      )}
    </Shell>
  );
}
