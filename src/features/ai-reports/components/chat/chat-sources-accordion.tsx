'use client';

import { Database } from 'lucide-react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion/accordion';
import { Badge } from '@/components/ui/badge';

import type { SourceDisplay } from '../../types';

type ChatSourcesAccordionProps = {
  sources?: unknown;
  sources_display?: SourceDisplay[];
  tools_used?: string[];
};

/** « Basé sur 128 examens » — effectif du périmètre après suppression K. */
function cellCountLabel(cellCount: number | null): string | null {
  if (cellCount === null || cellCount === undefined) return null;
  return cellCount > 1
    ? `Basé sur ${cellCount} examens`
    : `Basé sur ${cellCount} examen`;
}

function SourceCard({ source }: { source: SourceDisplay }) {
  const countLabel = cellCountLabel(source.cell_count);
  return (
    <div className="bg-muted/40 space-y-1.5 rounded-md border border-border p-2.5">
      <div className="flex items-center gap-1.5">
        <Database className="size-3.5 shrink-0 text-primary" aria-hidden />
        <span className="text-xs font-medium">{source.label}</span>
      </div>
      {source.filters.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {source.filters.map((filter) => (
            <Badge
              key={`${filter.label}-${filter.value}`}
              variant="secondary"
              className="text-[10px] font-normal"
            >
              {filter.label} : {filter.value}
            </Badge>
          ))}
        </div>
      )}
      {countLabel && (
        <p className="text-[11px] text-muted-foreground">{countLabel}</p>
      )}
    </div>
  );
}

/**
 * Transparence de la réponse : cartes « sources » lisibles (libellé FR de
 * l'indicateur, filtres appliqués, effectif) construites côté backend
 * (sources_display). Le JSON brut et les noms techniques d'outils restent
 * accessibles dans un repli « Détails techniques » (debug), replié par défaut.
 */
export function ChatSourcesAccordion({
  sources,
  sources_display,
  tools_used,
}: ChatSourcesAccordionProps) {
  const displayCards = sources_display ?? [];
  const uniqueTools = Array.from(new Set(tools_used ?? []));
  const hasRawSources = sources !== undefined && sources !== null;

  if (displayCards.length === 0 && !hasRawSources && uniqueTools.length === 0)
    return null;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="sources" className="border-none">
        <AccordionTrigger className="py-1 text-xs text-muted-foreground hover:no-underline">
          Sources et outils utilisés
        </AccordionTrigger>
        <AccordionContent className="space-y-2 pb-1">
          {displayCards.length > 0 && (
            <div className="space-y-1.5">
              {displayCards.map((source, index) => (
                <SourceCard key={`${source.tool}-${index}`} source={source} />
              ))}
            </div>
          )}
          {(hasRawSources || uniqueTools.length > 0) && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="technical" className="border-none">
                <AccordionTrigger className="py-1 text-[11px] text-muted-foreground hover:no-underline">
                  Détails techniques
                </AccordionTrigger>
                <AccordionContent className="space-y-2 pb-1">
                  {uniqueTools.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {uniqueTools.map((tool) => (
                        <Badge
                          key={tool}
                          variant="outline"
                          className="font-mono text-[10px]"
                        >
                          {tool}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {hasRawSources && (
                    <pre className="max-h-64 overflow-auto rounded-md bg-muted p-2 text-[11px] leading-relaxed">
                      {JSON.stringify(sources, null, 2)}
                    </pre>
                  )}
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
