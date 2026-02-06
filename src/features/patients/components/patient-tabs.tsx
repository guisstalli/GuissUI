'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type Exam, ExamsTable } from '@/features/exams/components/exams-table';

interface MedicalHistoryItem {
  id: string;
  date: string;
  condition: string;
  notes?: string;
}

interface PatientTabsProps {
  patient: {
    email?: string;
    phone?: string;
    address?: string;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
    insurance?: {
      provider: string;
      policyNumber: string;
    };
  };
  medicalHistory: MedicalHistoryItem[];
  exams: Exam[];
  onViewExam?: (examId: string) => void;
  onContinueExam?: (examId: string) => void;
}

export function PatientTabs({
  patient,
  medicalHistory,
  exams,
  onViewExam,
  onContinueExam,
}: PatientTabsProps) {
  return (
    <Tabs defaultValue="exams" className="w-full">
      <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent p-0">
        <TabsTrigger
          value="information"
          className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
        >
          Information
        </TabsTrigger>
        <TabsTrigger
          value="medical-history"
          className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
        >
          Medical History
        </TabsTrigger>
        <TabsTrigger
          value="exams"
          className="rounded-none border-b-2 border-transparent px-4 py-2.5 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
        >
          Exams
        </TabsTrigger>
      </TabsList>

      <TabsContent value="information" className="mt-6">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Contact Information */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-card-foreground">
              Contact Information
            </h3>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Email
                </dt>
                <dd className="mt-1 text-sm text-card-foreground">
                  {patient.email || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Phone
                </dt>
                <dd className="mt-1 text-sm text-card-foreground">
                  {patient.phone || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Address
                </dt>
                <dd className="mt-1 text-sm text-card-foreground">
                  {patient.address || '—'}
                </dd>
              </div>
            </dl>
          </div>

          {/* Emergency Contact */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-card-foreground">
              Emergency Contact
            </h3>
            {patient.emergencyContact ? (
              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Name
                  </dt>
                  <dd className="mt-1 text-sm text-card-foreground">
                    {patient.emergencyContact.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Phone
                  </dt>
                  <dd className="mt-1 text-sm text-card-foreground">
                    {patient.emergencyContact.phone}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Relationship
                  </dt>
                  <dd className="mt-1 text-sm text-card-foreground">
                    {patient.emergencyContact.relationship}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No emergency contact on file
              </p>
            )}
          </div>

          {/* Insurance Information */}
          <div className="rounded-lg border border-border bg-card p-4">
            <h3 className="text-sm font-semibold text-card-foreground">
              Insurance
            </h3>
            {patient.insurance ? (
              <dl className="mt-4 space-y-3">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Provider
                  </dt>
                  <dd className="mt-1 text-sm text-card-foreground">
                    {patient.insurance.provider}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Policy Number
                  </dt>
                  <dd className="mt-1 text-sm text-card-foreground">
                    {patient.insurance.policyNumber}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                No insurance information on file
              </p>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="medical-history" className="mt-6">
        {medicalHistory.length > 0 ? (
          <div className="space-y-3">
            {medicalHistory.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-card-foreground">
                      {item.condition}
                    </h4>
                    {item.notes && (
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.notes}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(item.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
            <p className="text-sm text-muted-foreground">
              No medical history recorded
            </p>
          </div>
        )}
      </TabsContent>

      <TabsContent value="exams" className="mt-6">
        <ExamsTable
          exams={exams}
          onViewExam={onViewExam}
          onContinueExam={onContinueExam}
        />
      </TabsContent>
    </Tabs>
  );
}
