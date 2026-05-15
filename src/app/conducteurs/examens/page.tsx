'use client';

import dayjs from 'dayjs';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

import { AppShell as Shell } from '@/app/_shell';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

const ITEMS_PER_PAGE = 15;

export default function ConducteursExamensPage() {
  const [currentPage, setCurrentPage] = useState(1);

  const { data, isLoading } = useAdultExams({
    params: {
      is_driver: true,
      limit: ITEMS_PER_PAGE,
      offset: (currentPage - 1) * ITEMS_PER_PAGE,
    },
  });

  const exams = data?.results ?? [];
  const totalCount = data?.count ?? 0;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  return (
    <Shell title="Examens conducteurs">
      <div className="space-y-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Examens des conducteurs</h2>
            <p className="text-sm text-muted-foreground">
              {totalCount} examen{totalCount !== 1 ? 's' : ''} de conducteur
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner />
          </div>
        ) : exams.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            <ClipboardList className="text-muted-foreground/40 mb-3 size-10" />
            <p className="font-medium text-muted-foreground">
              Aucun examen de conducteur
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <Table className="bg-card">
              <TableHeader>
                <TableRow>
                  <TableHead>N° Examen</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead className="hidden sm:table-cell">Site</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Statut</TableHead>
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
                    <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                      {exam.site_libelle ?? '—'}
                    </TableCell>
                    <TableCell className="hidden text-sm text-muted-foreground sm:table-cell">
                      {dayjs(exam.created).format('DD/MM/YYYY')}
                    </TableCell>
                    <TableCell>
                      {exam.is_completed ? (
                        <Badge className="gap-1 bg-emerald-100 text-emerald-800">
                          <Check className="size-3" />
                          Terminé
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="gap-1 bg-amber-50 text-amber-700"
                        >
                          <Clock className="size-3" />
                          En cours
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/exams/adult/${exam.id}`}>Voir</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-y-3">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} sur {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="mr-1 size-4" />
                Précédent
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Suivant
                <ChevronRight className="ml-1 size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </Shell>
  );
}
