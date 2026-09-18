'use client';

import { AlertCircle, Bot, Check, Copy } from 'lucide-react';
import { useCallback, useState } from 'react';

import { cn } from '@/utils/cn';

import type { ChatMessage as ChatMessageType } from '../../types';
import { lierCitations } from '../../utils/citations';
import { MarkdownContent } from '../markdown-content';

import { AnswerCharts } from './answer-charts';
import { ChatSourcesAccordion } from './chat-sources-accordion';
import { ChatTrajectoryAccordion } from './chat-trajectory-accordion';
import { useCitationComponents } from './citation-marker';
import { ReportArtifactCard } from './report-artifact-card';

type ChatMessageProps = {
  message: ChatMessageType;
};

/**
 * Copier une réponse : elle finit dans un compte rendu ou un courriel. La
 * sélectionner à la souris ramassait aussi les libellés des accordéons.
 */
function BoutonCopier({ texte }: { texte: string }) {
  const [copie, setCopie] = useState(false);

  if (!texte.trim()) return null;

  return (
    <button
      type="button"
      className="ml-auto flex items-center gap-1 rounded px-1.5 py-0.5 text-xs hover:bg-muted"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texte);
          setCopie(true);
          setTimeout(() => setCopie(false), 2000);
        } catch {
          // Presse-papiers refusé (contexte non sécurisé, permission) : on ne
          // casse pas l'affichage pour autant.
        }
      }}
    >
      {copie ? (
        <Check className="size-3 text-emerald-600" aria-hidden />
      ) : (
        <Copy className="size-3" aria-hidden />
      )}
      {copie ? 'Copié' : 'Copier'}
    </button>
  );
}

export function ChatMessage({ message }: ChatMessageProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    );
  }

  if (message.isError) {
    return (
      <div className="flex justify-start">
        <div className="border-destructive/30 bg-destructive/10 flex max-w-[85%] items-start gap-2 rounded-2xl rounded-bl-sm border px-4 py-2.5 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>{message.content}</p>
        </div>
      </div>
    );
  }

  // Réponse assistant : PLEINE COLONNE, sans bulle. Les réponses analytiques
  // contiennent des tableaux GFM et des sections ; les comprimer dans une bulle
  // à 85 % bordée les rendait illisibles et forçait un scroll horizontal. La
  // bulle reste sur les messages utilisateur, où elle distingue les tours.
  const artifacts = message.artifacts ?? [];

  return <ReponseAssistant message={message} artifacts={artifacts} />;
}

/**
 * Corps d'une réponse d'assistant. Séparé parce qu'il porte de l'état (la
 * source mise en avant par un clic sur « [n] ») : les branches « utilisateur »
 * et « erreur » ci-dessus rendent avant tout hook.
 */
function ReponseAssistant({
  message,
  artifacts,
}: {
  message: ChatMessageType;
  artifacts: NonNullable<ChatMessageType['artifacts']>;
}) {
  // Source désignée par le dernier clic sur un marqueur. Elle déplie
  // l'accordéon et met la carte en évidence : sans cela, le renvoi conduirait
  // à un bloc replié, donc à rien du tout.
  const [sourceActive, setSourceActive] = useState<number | null>(null);
  const selectionner = useCallback((numero: number) => {
    // Re-cliquer le même marqueur doit re-déclencher la mise en évidence.
    setSourceActive(null);
    requestAnimationFrame(() => setSourceActive(numero));
  }, []);
  const composants = useCitationComponents(selectionner);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span
          className={cn(
            'flex size-5 shrink-0 items-center justify-center rounded',
            'bg-primary/10 text-primary',
          )}
          aria-hidden
        >
          <Bot className="size-3.5" />
        </span>
        Assistant
        <BoutonCopier texte={message.content} />
      </div>
      <div className="min-w-0 space-y-2">
        <MarkdownContent
          content={lierCitations(message.content)}
          components={composants}
        />

        {/* Les répartitions citées dans le texte, tracées : le lecteur n'a plus
            à les reconstruire de tête. */}
        <AnswerCharts sources={message.sources_display} />

        {artifacts.map((artifact) => (
          <ReportArtifactCard
            key={`${artifact.type}-${artifact.report_id}`}
            artifact={artifact}
          />
        ))}

        <ChatSourcesAccordion
          sources={message.sources}
          sources_display={message.sources_display}
          tools_used={message.tools_used}
          sourceActive={sourceActive}
        />
        <ChatTrajectoryAccordion trajectory={message.trajectory} />
      </div>
    </div>
  );
}
