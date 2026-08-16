'use client';

import { MessageSquareText } from 'lucide-react';
import { useEffect, useRef } from 'react';

import { ScrollArea } from '@/components/ui/scroll-area';

import type { ChatMessage as ChatMessageType } from '../../types';

import { ChatMessage } from './chat-message';
import { ThinkingIndicator } from './thinking-indicator';

type ChatMessageListProps = {
  messages: ChatMessageType[];
  isThinking: boolean;
};

const EXAMPLE_QUESTIONS = [
  'Combien de patients ont été examinés ce mois-ci ?',
  'Quelle est la répartition des conclusions d’aptitude des conducteurs ?',
  'Quels sont les facteurs de risque les plus fréquents ?',
];

export function ChatMessageList({
  messages,
  isThinking,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isThinking]);

  if (messages.length === 0 && !isThinking) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="bg-primary/10 flex size-14 items-center justify-center rounded-full">
          <MessageSquareText className="size-7 text-primary" aria-hidden />
        </div>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold">
            Posez une question analytique
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            L&apos;assistant interroge les statistiques de dépistage et répond
            avec des chiffres vérifiés. Par exemple :
          </p>
        </div>
        <ul className="space-y-1 text-sm text-muted-foreground">
          {EXAMPLE_QUESTIONS.map((q) => (
            <li key={q} className="italic">
              « {q} »
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <ScrollArea className="min-h-0 flex-1">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 p-4">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isThinking && <ThinkingIndicator />}
        <div ref={bottomRef} />
      </div>
    </ScrollArea>
  );
}
