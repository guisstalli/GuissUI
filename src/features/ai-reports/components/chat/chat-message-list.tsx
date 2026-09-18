'use client';

import { ArrowDown, MessageSquareText } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
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

/** Marge sous laquelle on considère l'utilisateur « collé au bas » du fil. */
const BOTTOM_THRESHOLD_PX = 80;

export function ChatMessageList({
  messages,
  isThinking,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [colleEnBas, setColleEnBas] = useState(true);

  // Ne recoller au bas QUE si l'utilisateur y était déjà. L'ancienne version
  // appelait scrollIntoView à chaque changement, sans condition : remonter pour
  // relire une réponse pendant que l'assistant écrivait ramenait de force en
  // bas du fil — impossible de lire sa propre conversation en cours de tour.
  useEffect(() => {
    if (!colleEnBas) return;
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages.length, isThinking, colleEnBas]);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    setColleEnBas(
      scrollHeight - scrollTop - clientHeight <= BOTTOM_THRESHOLD_PX,
    );
  };

  // Repasser  à true suffit : l'effet ci-dessus fait le défilement.
  // L'appeler aussi ici déclenchait deux animations concurrentes.
  const revenirEnBas = () => setColleEnBas(true);

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
    <div className="relative flex min-h-0 flex-1 flex-col">
      <ScrollArea
        className="min-h-0 flex-1"
        viewportRef={viewportRef}
        onViewportScroll={handleScroll}
      >
        <div className="mx-auto flex max-w-3xl flex-col gap-6 p-4">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
          {isThinking && <ThinkingIndicator />}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {!colleEnBas && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={revenirEnBas}
          className="absolute bottom-3 left-1/2 -translate-x-1/2 shadow-md"
        >
          <ArrowDown className="mr-1.5 size-3.5" aria-hidden />
          Revenir en bas
        </Button>
      )}
    </div>
  );
}
