'use client';

import dayjs from 'dayjs';
import {
  Baby,
  CalendarIcon,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Filter,
  Search,
  User,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import { AppShell as Shell } from '@/app/_shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form/input';
import { Spinner } from '@/components/ui/spinner';
import {
  TableBody,
  TableCell,
  TableElement as Table,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdultExams } from '@/features/exams/api/adult/get-adult-exams';
import { useChildExams } from '@/features/exams/api/child/get-child-exams';
import type { ExamenAdult, ExamenChild } from '@/features/exams/types';

const ITEMS_PER_PAGE = 15;

type ExamType = 'adult' | 'child';
type CompletionFilter = 'all' | 'complete' | 'incomplete';

type UnifiedExam = {
  id: number;
  numero_examen: string;
  patient_name: string;
  site_libelle: string | null | undefined;
  is_completed: boolean | undefined;
  created: string;
  type: ExamType;
};

function toUnified(exam: ExamenAdult, type: 'adult'): UnifiedExam;
function toUnified(exam: ExamenChild, type: 'child'): UnifiedExam;
function toUnified(
  exam: ExamenAdult | ExamenChild,
  type: ExamType,
): UnifiedExam {
  return {
    id: exam.id,
    numero_examen: exam.numero_examen,
    patient_name: exam.patient_name,
    site_libelle: exam.site_libelle,
    is_completed: 'is_completed' in exam ? exam.is_completed : undefined,
    created: exam.created,
    type,
  };
}

export default function ExamsPage() {
  const [examType, setExamType] = useState<ExamType>('adult');
  const [completion, setCompletion] = useState<CompletionFilter>('all');
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [createdAfter, setCreatedAfter] = useState('');
  const [createdBefore, setCreatedBefore] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    setCurrentPage(1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  }, []);

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  const queryParams = {
    search: debouncedSearch || undefined,
    is_completed: completion === 'all' ? undefined : completion === 'complete',
    created_after: createdAfter || undefined,
    created_before: createdBefore || undefined,
    limit: ITEMS_PER_PAGE,
    offset: (currentPage - 1) * ITEMS_PER_PAGE,
  };

  const adultQuery = useAdultExams({
    params: queryParams,
    enabled: examType === 'adult',
  });

  const childQuery = useChildExams({
    params: queryParams,
    enabled: examType === 'child',
  });

  const activeQuery = examType === 'adult' ? adultQuery : childQuery;
  const { data, isLoading } = activeQuery;

  const exams: UnifiedExam[] = (data?.results ?? []).map((e) =>
    examType === 'adult'
      ? toUnified(e as ExamenAdult, 'adult')
      : toUnified(e as ExamenChild, 'child'),
  );

  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const hasActiveFilters =
    completion !== 'all' ||
    !!createdAfter ||
    !!createdBefore ||
    !!debouncedSearch;

  const clearFilters = () => {
    setCompletion('all');
    setCreatedAfter('');
    setCreatedBefore('');
    setSearchInput('');
    setDebouncedSearch('');
    setCurrentPage(1);
  };

  const handleTypeChange = (type: ExamType) => {
    setExamType(type);
    setCurrentPage(1);
    if (type === 'child') setCompletion('all');
  };

  const examDetailPath = (exam: UnifiedExam) =>
    exam.type === 'adult'
      ? `/exams/adult/${exam.id}`
      : `/exams/child/${exam.id}`;

  return (
    <Shell title="Examens">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Liste des examens</h2>
            <p className="text-sm text-muted-foreground">
              {totalCount} examen{totalCount !== 1 ? 's' : ''} trouvé
              {totalCount !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters((v) => !v)}
          >
            <Filter className="mr-1.5 size-3.5" />
            Filtres
            {hasActiveFilters && (
              <span className="ml-1.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                !
              </span>
            )}
          </Button>
        </div>

        {/* Type toggle */}
        <div className="flex w-fit gap-1 rounded-lg border bg-card p-1">
          <button
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              examType === 'adult'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => handleTypeChange('adult')}
          >
            <User className="size-3.5" />
            Adultes
          </button>
          <button
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              examType === 'child'
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => handleTypeChange('child')}
          >
            <Baby className="size-3.5" />
            Enfants
          </button>
        </div>

        {/* Filters panel */}
        {showFilters && (
          <div className="bg-muted/30 rounded-lg border p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-8"
                  placeholder="Rechercher un patient..."
                  value={searchInput}
                  onChange={(e) => handleSearchChange(e.target.value)}
                />
              </div>

              {/* Completion (adult only) */}
              {examType === 'adult' && (
                <div className="flex gap-1 rounded-lg border bg-background p-1">
                  {(['all', 'complete', 'incomplete'] as const).map((opt) => (
                    <button
                      key={opt}
                      className={`flex-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                        completion === opt
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => {
                        setCompletion(opt);
                        setCurrentPage(1);
                      }}
                    >
                      {opt === 'all'
                        ? 'Tous'
                        : opt === 'complete'
                          ? 'Complets'
                          : 'Incomplets'}
                    </button>
                  ))}
                </div>
              )}

              {/* Date after */}
              <div className="relative">
                <CalendarIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  className="pl-8"
                  placeholder="Après le..."
                  value={createdAfter}
                  onChange={(e) => {
                    setCreatedAfter(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              {/* Date before */}
              <div className="relative">
                <CalendarIcon className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="date"
                  className="pl-8"
                  placeholder="Avant le..."
                  value={createdBefore}
                  onChange={(e) => {
                    setCreatedBefore(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-3 flex justify-end">
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-1.5 size-3.5" />
                  Effacer les filtres
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        ) : exams.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <p className="font-medium text-muted-foreground">
              Aucun examen trouvé
            </p>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={clearFilters}
              >
                Effacer les filtres
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-lg border bg-card">
            <Table className="bg-card">
              <TableHeader>
                <TableRow>
                  <TableHead>N° Examen</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Site</TableHead>
                  {examType === 'adult' && <TableHead>Statut</TableHead>}
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exams.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {exam.numero_examen}
                    </TableCell>
                    <TableCell className="font-medium">
                      {exam.patient_name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {exam.site_libelle ?? '—'}
                    </TableCell>
                    {examType === 'adult' && (
                      <TableCell>
                        {exam.is_completed ? (
                          <Badge className="gap-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                            <Check className="size-3" />
                            Complet
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="gap-1 border-amber-300 text-amber-600 dark:text-amber-400"
                          >
                            <Clock className="size-3" />
                            En cours
                          </Badge>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="text-muted-foreground">
                      {dayjs(exam.created).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={examDetailPath(exam)}>Ouvrir</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {currentPage} sur {totalPages} ({totalCount} résultats)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
