'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion/accordion';
import { Badge } from '@/components/ui/badge';

type ChatSourcesAccordionProps = {
  sources?: unknown;
  tools_used?: string[];
};

/**
 * Transparence de la réponse : les agrégats sources (JSON brut, repliés) et
 * les outils analytiques appelés par l'agent.
 */
export function ChatSourcesAccordion({
  sources,
  tools_used,
}: ChatSourcesAccordionProps) {
  const uniqueTools = Array.from(new Set(tools_used ?? []));
  const hasSources = sources !== undefined && sources !== null;

  if (!hasSources && uniqueTools.length === 0) return null;

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="sources" className="border-none">
        <AccordionTrigger className="py-1 text-xs text-muted-foreground hover:no-underline">
          Sources et outils utilisés
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
          {hasSources && (
            <pre className="max-h-64 overflow-auto rounded-md bg-muted p-2 text-[11px] leading-relaxed">
              {JSON.stringify(sources, null, 2)}
            </pre>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
