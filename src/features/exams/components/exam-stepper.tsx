'use client';

import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
}

interface ExamStepperProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  allowNavigation?: boolean;
}

export function ExamStepper({
  steps,
  currentStep,
  onStepClick,
  allowNavigation = false,
}: ExamStepperProps) {
  return (
    <nav aria-label="Exam progress">
      <ol className="flex items-center justify-center gap-0">
        {steps.map((step, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const isClickable = allowNavigation && isCompleted;

          return (
            <li key={step.id} className="flex items-center">
              {/* Step Indicator */}
              <button
                type="button"
                onClick={() => isClickable && onStepClick?.(index)}
                disabled={!isClickable}
                className={cn(
                  'flex items-center gap-2 rounded-md px-3 py-2 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                  isClickable && 'cursor-pointer hover:bg-muted/50',
                  !isClickable && 'cursor-default',
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {/* Step Circle */}
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors',
                    isCompleted &&
                      'border-primary bg-primary text-primary-foreground',
                    isCurrent && 'border-primary text-primary',
                    !isCompleted &&
                      !isCurrent &&
                      'border-muted-foreground/30 text-muted-foreground',
                  )}
                >
                  {isCompleted ? (
                    <Check className="size-4" aria-hidden="true" />
                  ) : (
                    index + 1
                  )}
                </span>

                {/* Step Title */}
                <span
                  className={cn(
                    'text-sm font-medium',
                    isCurrent && 'text-foreground',
                    isCompleted && 'text-foreground',
                    !isCompleted && !isCurrent && 'text-muted-foreground',
                  )}
                >
                  {step.title}
                </span>
              </button>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-8',
                    index < currentStep
                      ? 'bg-primary'
                      : 'bg-muted-foreground/30',
                  )}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
