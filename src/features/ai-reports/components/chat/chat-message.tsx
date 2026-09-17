'use client';

import { AlertCircle, Bot } from 'lucide-react';

import { cn } from '@/utils/cn';

import type { ChatMessage as ChatMessageType } from '../../types';
import { MarkdownContent } from '../markdown-content';

import { ChatSourcesAccordion } from './chat-sources-accordion';
import { ChatTrajectoryAccordion } from './chat-trajectory-accordion';
import { ReportArtifactCard } from './report-artifact-card';

type ChatMessageProps = {
  message: ChatMessageType;
};

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
      </div>
      <div className="min-w-0 space-y-2">
        <MarkdownContent content={message.content} />

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
        />
        <ChatTrajectoryAccordion trajectory={message.trajectory} />
      </div>
    </div>
  );
}
