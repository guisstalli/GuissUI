'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TableBody,
  TableCell,
  TableElement as Table,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

export interface Exam {
  id: string;
  date: string;
  type: 'Adult' | 'Child';
  status: 'Complete' | 'In Progress' | 'Pending Review';
  lastUpdate: string;
}

interface ExamsTableProps {
  exams: Exam[];
  onViewExam?: (examId: string) => void;
  onContinueExam?: (examId: string) => void;
}

function getStatusVariant(status: Exam['status']) {
  switch (status) {
    case 'Complete':
      return 'default';
    case 'In Progress':
      return 'secondary';
    case 'Pending Review':
      return 'outline';
    default:
      return 'secondary';
  }
}

export function ExamsTable({
  exams,
  onViewExam,
  onContinueExam,
}: ExamsTableProps) {
  if (exams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
        <p className="text-sm text-muted-foreground">No exams found</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Create a new exam to get started
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Exam Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Update</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {exams.map((exam) => (
          <TableRow key={exam.id}>
            <TableCell className="font-medium">
              {new Date(exam.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </TableCell>
            <TableCell>{exam.type}</TableCell>
            <TableCell>
              <Badge
                variant={getStatusVariant(exam.status)}
                className={cn(
                  'font-normal',
                  exam.status === 'Complete' && 'bg-medical-success text-white',
                  exam.status === 'In Progress' &&
                    'bg-medical-warning text-foreground',
                  exam.status === 'Pending Review' &&
                    'border-medical-info text-medical-info',
                )}
              >
                {exam.status}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {new Date(exam.lastUpdate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </TableCell>
            <TableCell className="text-right">
              {exam.status === 'Complete' ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewExam?.(exam.id)}
                >
                  View
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onContinueExam?.(exam.id)}
                >
                  Continue
                </Button>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
