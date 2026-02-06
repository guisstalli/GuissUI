import { Badge } from '@/components/ui/badge';

interface PatientInfoProps {
  patient: {
    id: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    age: number;
    sex: 'Male' | 'Female' | 'Other';
    isAdult: boolean;
    medicalRecordNumber: string;
  };
}

export function PatientInfo({ patient }: PatientInfoProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold text-card-foreground">
            {patient.lastName}, {patient.firstName}
          </h2>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>
              <span className="sr-only">Patient ID: </span>
              ID: {patient.id}
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <span className="sr-only">Medical Record Number: </span>
              MRN: {patient.medicalRecordNumber}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-normal">
            {patient.isAdult ? 'Adult' : 'Child'}
          </Badge>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4 border-t border-border pt-4 sm:grid-cols-4">
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Age
          </dt>
          <dd className="mt-1 text-sm font-medium text-card-foreground">
            {patient.age} years
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Sex
          </dt>
          <dd className="mt-1 text-sm font-medium text-card-foreground">
            {patient.sex}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Date of Birth
          </dt>
          <dd className="mt-1 text-sm font-medium text-card-foreground">
            {new Date(patient.dateOfBirth).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Classification
          </dt>
          <dd className="mt-1 text-sm font-medium text-card-foreground">
            {patient.isAdult ? 'Adult Patient' : 'Pediatric Patient'}
          </dd>
        </div>
      </div>
    </div>
  );
}
