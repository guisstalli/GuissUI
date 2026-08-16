'use client';

import { ChevronDown, Route, TriangleAlert, Wrench } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/utils/cn';

import type { TrajectoryStep } from '../../types';

type ChatTrajectoryAccordionProps = {
  trajectory?: TrajectoryStep[];
};

/**
 * Trajectoire agentique du tour, repliée par défaut : chaque pas montre les
 * outils appelés et les éventuelles erreurs auto-corrigées par l'agent.
 * Transparence du raisonnement sans surcharger la réponse.
 */
export function ChatTrajectoryAccordion({
  trajectory,
}: ChatTrajectoryAccordionProps) {
  const [open, setOpen] = useState(false);

  const steps = (trajectory ?? []).filter(
    (step) => step.tool_calls.length > 0 || step.errors.length > 0,
  );
  if (steps.length === 0) return null;

  const toolCount = steps.reduce((acc, s) => acc + s.tool_calls.length, 0);

  return (
    <div className="border-border/60 border-t pt-1.5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        aria-expanded={open}
      >
        <Route className="size-3.5" aria-hidden />
        <span>
          Raisonnement de l&apos;agent ({toolCount} appel
          {toolCount > 1 ? 's' : ''} d&apos;outil)
        </span>
        <ChevronDown
          className={cn('size-3.5 transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>
      {open && (
        <ol className="mt-2 space-y-1.5">
          {steps.map((step) => (
            <li
              key={step.index}
              className="bg-muted/50 rounded-md px-2.5 py-1.5 text-xs"
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-medium text-muted-foreground">
                  Étape {step.index + 1}
                </span>
                {step.tool_calls.map((tool, i) => (
                  <span
                    key={`${tool}-${i}`}
                    className="bg-primary/10 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] text-primary"
                  >
                    <Wrench className="size-3" aria-hidden />
                    {tool}
                  </span>
                ))}
              </div>
              {step.errors.length > 0 && (
                <p className="mt-1 flex items-start gap-1 text-[11px] text-amber-600 dark:text-amber-500">
                  <TriangleAlert
                    className="mt-0.5 size-3 shrink-0"
                    aria-hidden
                  />
                  <span>
                    {step.errors.length} erreur
                    {step.errors.length > 1 ? 's' : ''} d&apos;outil
                    auto-corrigée{step.errors.length > 1 ? 's' : ''} par
                    l&apos;agent
                  </span>
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
