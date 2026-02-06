'use client';

import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  Search,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { Shell } from '@/components/layouts';
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
import { useAdultExams } from '@/features/exams/api';
import type { ExamsQueryParams } from '@/features/exams/types';

const ITEMS_PER_PAGE = 10;

export default function AdultExamsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      if (searchQuery !== debouncedSearch) {
        setCurrentPage(1);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, debouncedSearch]);

  // Construire les paramètres de requête
  const queryParams: ExamsQueryParams = {
    limit: ITEMS_PER_PAGE,
    offset: (currentPage - 1) * ITEMS_PER_PAGE,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(statusFilter === 'complete' && { is_completed: true }),
    ...(statusFilter === 'in-progress' && { is_completed: false }),
    ordering: '-created',
  };

  const {
    data: examsData,
    isLoading,
    isError,
    refetch,
  } = useAdultExams({ params: queryParams });

  const exams = examsData?.results ?? [];
  const totalCount = examsData?.count ?? 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const handleStatusFilter = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  return (
    <Shell title="Examens Adultes">
      {/* Filters */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative max-w-sm flex-1">
          <Search
            className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            type="search"
            placeholder="Rechercher par patient ou numéro d'examen..."
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

      {/* Loading State */}
      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
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

      {/* Exams Table */}
      {!isLoading && !isError && (
        <>
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Examen</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière mise à jour</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Aucun examen trouvé.
                    </TableCell>
                  </TableRow>
                ) : (
                  exams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {exam.numero_examen}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/patients/${exam.patient}`}
                          className="text-sm font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {exam.patient_name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(exam.created).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={exam.is_completed ? 'outline' : 'secondary'}
                          className="text-xs"
                        >
                          {exam.is_completed ? 'Complété' : 'En cours'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
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
