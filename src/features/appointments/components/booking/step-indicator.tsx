import { CheckCircle2 } from 'lucide-react';

import { cn } from '@/lib/utils';

export type Step = 'date' | 'slot' | 'info';

export const STEPS: { id: Step; label: string }[] = [
  { id: 'date', label: 'Date' },
  { id: 'slot', label: 'Créneau' },
  { id: 'info', label: 'Informations' },
];

export function StepIndicator({ current }: { current: Step }) {
  const currentIdx = STEPS.findIndex((s) => s.id === current);

  return (
    <div className="flex items-center justify-center">
      {STEPS.map((step, i) => {
        const done = i < currentIdx;
        const active = step.id === current;

        return (
          <div key={step.id} className="flex items-center">
            {/* circle */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'flex size-9 items-center justify-center rounded-full border-2 text-sm font-bold transition-all duration-300',
                  done &&
                    'border-emerald-500/50 bg-emerald-50 text-emerald-600 dark:border-emerald-400/50 dark:bg-emerald-400/[0.12] dark:text-emerald-400',
                  active &&
                    'border-cyan-500 bg-cyan-50 text-cyan-700 dark:border-cyan-400/60 dark:bg-cyan-400/[0.15] dark:text-cyan-300',
                  !done &&
                    !active &&
                    'border-border bg-transparent text-muted-foreground',
                )}
                style={
                  active
                    ? { boxShadow: '0 0 18px rgba(34,211,238,0.15)' }
                    : undefined
                }
              >
                {done ? <CheckCircle2 className="size-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  'hidden text-xs font-medium sm:block',
                  active
                    ? 'text-cyan-600 dark:text-cyan-400'
                    : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>

            {/* connector */}
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  'mx-3 mb-5 h-px w-12 rounded-full transition-all duration-300 sm:w-20',
                  done ? 'bg-emerald-400/50' : 'bg-border dark:bg-white/[0.08]',
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
