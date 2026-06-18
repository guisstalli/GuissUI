import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import {
  TableBody,
  TableCell,
  TableElement as Table,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import type { CohortPatientItem } from '../../types/types';
import { AnalyticsEmptyState } from '../analytics-states';

type CohortPatientTableProps = {
  patients: CohortPatientItem[];
  isLoading: boolean;
  isSelected: (id: number) => boolean;
  onToggle: (id: number) => void;
  onToggleAllPage: (allSelected: boolean) => void;
};

const COLUMN_COUNT = 6;

const formatLastExam = (value: string | null): string => (value ? value : '—');

const TableSkeleton = () => (
  <Table className="bg-card">
    <TableHeader>
      <TableRow>
        {Array.from({ length: COLUMN_COUNT }).map((_, i) => (
          <TableHead key={i}>
            <Skeleton className="h-4 w-16" />
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
    <TableBody>
      {Array.from({ length: 6 }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: COLUMN_COUNT }).map((_, cellIndex) => (
            <TableCell key={cellIndex}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

export const CohortPatientTable = ({
  patients,
  isLoading,
  isSelected,
  onToggle,
  onToggleAllPage,
}: CohortPatientTableProps) => {
  if (isLoading) {
    return <TableSkeleton />;
  }

  if (patients.length === 0) {
    return (
      <AnalyticsEmptyState
        title="Aucun patient"
        description="Aucun patient ne correspond à ce critère dans le périmètre actuel."
      />
    );
  }

  const allPageSelected = patients.every((p) => isSelected(p.id));

  return (
    <Table className="bg-card">
      <TableHeader>
        <TableRow>
          <TableHead className="w-10">
            <Checkbox
              checked={allPageSelected}
              onCheckedChange={() => onToggleAllPage(allPageSelected)}
              aria-label="Tout sélectionner"
            />
          </TableHead>
          <TableHead>Nom</TableHead>
          <TableHead>Sexe</TableHead>
          <TableHead>Âge</TableHead>
          <TableHead>Conducteur</TableHead>
          <TableHead>Dernier examen</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {patients.map((patient) => {
          const selected = isSelected(patient.id);
          return (
            <TableRow
              key={patient.id}
              data-state={selected ? 'selected' : undefined}
            >
              <TableCell>
                <Checkbox
                  checked={selected}
                  onCheckedChange={() => onToggle(patient.id)}
                  aria-label={`Sélectionner ${patient.full_name}`}
                />
              </TableCell>
              <TableCell className="font-medium">
                <Link
                  href={`/patients/${patient.id}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  {patient.full_name}
                </Link>
              </TableCell>
              <TableCell>{patient.sex}</TableCell>
              <TableCell>{patient.age}</TableCell>
              <TableCell>
                {patient.is_driver ? (
                  <Badge variant="secondary">Conducteur</Badge>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatLastExam(patient.last_exam_date)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
