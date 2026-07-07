'use client';

import { useState } from 'react';

import { AppShell as Shell } from '@/app/_shell';
import { Can } from '@/components/ui/can';
import { useAsk } from '@/features/ai-reports/api/ask';
import { ChatDisclaimerBanner } from '@/features/ai-reports/components/chat/chat-disclaimer-banner';
import { ChatInput } from '@/features/ai-reports/components/chat/chat-input';
import { ChatMessageList } from '@/features/ai-reports/components/chat/chat-message-list';
import type { ChatMessage } from '@/features/ai-reports/types';

const QUOTA_MESSAGE =
  'Limite de questions atteinte (30 par heure). Réessayez dans quelques minutes.';
const GENERIC_ERROR_MESSAGE =
  "L'assistant n'a pas pu répondre. Vérifiez que le module IA est configuré, puis réessayez.";

const newId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function AssistantIaPage() {
  // Historique de SESSION uniquement — rien n'est persisté côté serveur.
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const askMutation = useAsk({
    mutationConfig: {
      onSuccess: (response) => {
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: 'assistant',
            content: response.answer_markdown,
            sources: response.sources,
            verification: response.verification,
            tools_used: response.tools_used,
            timestamp: Date.now(),
          },
        ]);
      },
      onError: (error) => {
        const isQuota =
          error instanceof Error &&
          'status' in error &&
          (error as { status?: number }).status === 429;
        setMessages((prev) => [
          ...prev,
          {
            id: newId(),
            role: 'assistant',
            content: isQuota ? QUOTA_MESSAGE : GENERIC_ERROR_MESSAGE,
            timestamp: Date.now(),
            isError: true,
          },
        ]);
      },
    },
  });

  const handleSend = (question: string) => {
    if (askMutation.isPending) return;
    setMessages((prev) => [
      ...prev,
      { id: newId(), role: 'user', content: question, timestamp: Date.now() },
    ]);
    askMutation.mutate({ question });
  };

  return (
    <Can permission="ai-reports:generate">
      <Shell title="Assistant IA">
        <div className="flex h-[calc(100vh-9rem)] flex-col gap-3">
          <ChatDisclaimerBanner />
          <div className="flex min-h-0 flex-1 flex-col rounded-lg border border-border bg-background">
            <ChatMessageList
              messages={messages}
              isThinking={askMutation.isPending}
            />
            <div className="border-t border-border p-3">
              <ChatInput onSend={handleSend} disabled={askMutation.isPending} />
            </div>
          </div>
        </div>
      </Shell>
    </Can>
  );
}
