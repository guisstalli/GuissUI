'use client';

import { AlertTriangle, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ClinicalSummaryPanelProps {
  lastExamDate?: string;
  lastExamSummary?: string;
  alerts?: Array<{
    id: string;
    message: string;
    severity: 'warning' | 'info';
  }>;
  clinicalNotes?: string;
  onClose?: () => void;
}

export function ClinicalSummaryPanel({
  lastExamDate,
  lastExamSummary,
  alerts = [],
  clinicalNotes,
  onClose,
}: ClinicalSummaryPanelProps) {
  return (
    <aside className="w-80 shrink-0 border-l border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Clinical Summary
        </h2>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="size-7"
            onClick={onClose}
            aria-label="Close panel"
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <div className="mt-4 space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Alerts
          </h3>
          <ul className="space-y-2">
            {alerts.map((alert) => (
              <li
                key={alert.id}
                className={cn(
                  'flex items-start gap-2 rounded-md border p-2 text-sm',
                  alert.severity === 'warning'
                    ? 'border-medical-warning/30 bg-medical-warning/10'
                    : 'border-medical-info/30 bg-medical-info/10',
                )}
              >
                <AlertTriangle
                  className={cn(
                    'mt-0.5 h-4 w-4 shrink-0',
                    alert.severity === 'warning'
                      ? 'text-medical-warning'
                      : 'text-medical-info',
                  )}
                  aria-hidden="true"
                />
                <span className="text-card-foreground">{alert.message}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Last Exam Summary */}
      {lastExamDate && (
        <div className="mt-6">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Last Exam
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(lastExamDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          {lastExamSummary && (
            <p className="mt-2 text-sm leading-relaxed text-card-foreground">
              {lastExamSummary}
            </p>
          )}
        </div>
      )}

      {/* Clinical Notes */}
      {clinicalNotes && (
        <div className="mt-6">
          <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Clinical Notes
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-card-foreground">
            {clinicalNotes}
          </p>
        </div>
      )}

      {/* Empty State */}
      {!lastExamDate && alerts.length === 0 && !clinicalNotes && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            No clinical summary available
          </p>
        </div>
      )}
    </aside>
  );
}
