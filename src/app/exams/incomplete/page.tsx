'use client';

import { AlertCircle, Clock, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';

import { Shell } from '@/components/layouts';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TableBody,
  TableCell,
  TableElement as Table,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  useIncompleteAdultExams,
  useIncompleteChildExams,
} from '@/features/exams/api';

export default function IncompleteExamsPage() {
  const {
    data: adultExamsData,
    isLoading: isLoadingAdult,
    isError: isErrorAdult,
    refetch: refetchAdult,
  } = useIncompleteAdultExams();

  const {
    data: childExamsData,
    isLoading: isLoadingChild,
    isError: isErrorChild,
    refetch: refetchChild,
  } = useIncompleteChildExams();

  const isLoading = isLoadingAdult || isLoadingChild;
  const isError = isErrorAdult || isErrorChild;

  const refetch = () => {
    refetchAdult();
    refetchChild();
  };

  // Combiner les examens adultes et enfants incomplets
  const adultExams = (adultExamsData?.results ?? []).map((exam) => ({
    id: exam.id,
    numero_examen: exam.numero_examen,
    patient: exam.patient,
    patient_name: exam.patient_name,
    type: 'Adulte' as const,
    created: exam.created,
    modified: exam.modified,
    is_completed: exam.is_completed,
  }));

  const childExams = (childExamsData?.results ?? [])
    .filter((exam) => !exam.reflet_pupillaire || !exam.fo) // Filtrer les incomplets
    .map((exam) => ({
      id: exam.id,
      numero_examen: exam.numero_examen,
      patient: exam.patient,
      patient_name: exam.patient_name,
      type: 'Enfant' as const,
      created: exam.created,
      modified: exam.modified,
      is_completed: !!(exam.reflet_pupillaire && exam.fo),
    }));

  // Combiner et trier par date de modification (plus récent en premier)
  const incompleteExams = [...adultExams, ...childExams].sort(
    (a, b) => new Date(b.modified).getTime() - new Date(a.modified).getTime(),
  );

  const totalIncomplete = incompleteExams.length;
  const adultCount = adultExams.length;
  const childCount = childExams.length;

  return (
    <Shell title="Examens Incomplets">
      {/* Alert Banner */}
      {totalIncomplete > 0 && (
        <div className="border-warning/30 bg-warning/10 mb-6 flex items-center gap-3 rounded-lg border p-4">
          <AlertCircle
            className="size-5 shrink-0 text-warning"
            aria-hidden="true"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground">
              {totalIncomplete} examen{totalIncomplete > 1 ? 's' : ''} nécessite
              {totalIncomplete > 1 ? 'nt' : ''} votre attention
            </p>
            <p className="text-sm text-muted-foreground">
              Ces examens ont été commencés mais pas encore complétés. Veuillez
              les réviser et les finaliser.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            disabled={isLoading}
          >
            <RefreshCw
              className={`mr-1.5 size-4 ${isLoading ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
            Rafraîchir
          </Button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {isError && !isLoading && (
        <div className="flex h-64 flex-col items-center justify-center gap-4">
          <p className="text-destructive">
            Erreur lors du chargement des examens
          </p>
          <Button variant="outline" onClick={refetch}>
            Réessayer
          </Button>
        </div>
      )}

      {/* Content */}
      {!isLoading && !isError && (
        <>
          {/* Stats */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Incomplets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-foreground">
                  {totalIncomplete}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Examens Adultes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-foreground">
                  {adultCount}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Examens Enfants
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-foreground">
                  {childCount}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Exams Table */}
          <div className="rounded-lg border border-border bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Examen</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Dernière mise à jour</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incompleteExams.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      Aucun examen incomplet. Excellent travail !
                    </TableCell>
                  </TableRow>
                ) : (
                  incompleteExams.map((exam) => (
                    <TableRow key={`${exam.type}-${exam.id}`}>
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
                      <TableCell>
                        <Badge
                          variant={
                            exam.type === 'Adulte' ? 'secondary' : 'outline'
                          }
                          className="text-xs"
                        >
                          {exam.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(exam.created).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Clock className="size-3.5" aria-hidden="true" />
                          {new Date(exam.modified).toLocaleString('fr-FR')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="default" size="sm" asChild>
                          <Link
                            href={`/exams/${exam.type === 'Adulte' ? 'adult' : 'child'}/${exam.id}`}
                          >
                            Continuer
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </Shell>
  );
}
