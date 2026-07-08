'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';

import { useAsk } from '../../api/ask';
import {
  getConversationQueryOptions,
  useConversation,
} from '../../api/get-conversation';
import type {
  AskResponse,
  ChatMessage,
  ConversationDetail,
  ConversationMessage,
} from '../../types';
import { toChatMessage } from '../../types';

import { ChatDisclaimerBanner } from './chat-disclaimer-banner';
import { ChatInput } from './chat-input';
import { ChatMessageList } from './chat-message-list';

const QUOTA_MESSAGE =
  'Limite de questions atteinte (30 par heure). Réessayez dans quelques minutes.';
const GENERIC_ERROR_MESSAGE =
  "L'assistant n'a pas pu répondre. Vérifiez que le module IA est configuré, puis réessayez.";

const TITLE_MAX_LENGTH = 255;

const newLocalId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/** Messages persistés forgés depuis la réponse d'ask — sème le cache TanStack
 *  sans refetch. L'id négatif du message user est synthétique (inconnu côté
 *  client) ; le prochain refetch du détail le réconcilie. */
const forgeTurnMessages = (
  question: string,
  response: AskResponse,
): ConversationMessage[] => {
  const now = new Date().toISOString();
  return [
    {
      id: -response.message_id,
      role: 'USER',
      content: question,
      status: 'SUCCESS',
      error_message: '',
      sources: null,
      sources_display: null,
      verification: null,
      tools_used: [],
      created_at: now,
    },
    {
      id: response.message_id,
      role: 'ASSISTANT',
      content: response.answer_markdown,
      status: 'SUCCESS',
      error_message: '',
      sources: response.sources,
      sources_display: response.sources_display,
      verification: response.verification,
      tools_used: response.tools_used,
      created_at: now,
    },
  ];
};

type AssistantChatProps = {
  /** Absent : nouvelle conversation (créée au premier envoi puis redirigée). */
  conversationId?: number;
};

/**
 * Fil de chat persistant de l'assistant analytique. Le cache TanStack est la
 * source de vérité (plus d'historique en useState) :
 * - conversation existante → détail chargé/mis en cache, tours suivants
 *   réconciliés par setQueryData (zéro refetch) ;
 * - nouvelle conversation → le premier succès sème le cache du détail PUIS
 *   redirige vers /assistant-ia/[id] : la page monte cache chaud, sans flash.
 * Pendant le vol, une bulle user optimiste est concaténée au rendu. Sur 429,
 * rien n'est persisté côté serveur → la bulle disparaît au rechargement
 * (comportement accepté).
 */
export function AssistantChat({ conversationId }: AssistantChatProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const isExisting = conversationId !== undefined;
  const conversationQuery = useConversation(conversationId ?? 0, {
    enabled: isExisting,
  });

  // Bulles en vol (question envoyée / erreur du tour) — état de VUE uniquement.
  const [pendingQuestion, setPendingQuestion] = useState<string | null>(null);
  const [flightError, setFlightError] = useState<ChatMessage | null>(null);

  const askMutation = useAsk({
    mutationConfig: {
      onSuccess: (response) => {
        const question = pendingQuestion ?? '';
        const turn = forgeTurnMessages(question, response);
        if (isExisting) {
          queryClient.setQueryData<ConversationDetail>(
            getConversationQueryOptions(conversationId).queryKey,
            (old) =>
              old
                ? {
                    ...old,
                    updated_at: new Date().toISOString(),
                    messages: [...old.messages, ...turn],
                  }
                : old,
          );
        } else {
          // Semer le cache AVANT la redirection : la page [id] monte chaud.
          const now = new Date().toISOString();
          queryClient.setQueryData<ConversationDetail>(
            getConversationQueryOptions(response.conversation_id).queryKey,
            {
              id: response.conversation_id,
              title: question.slice(0, TITLE_MAX_LENGTH),
              created_at: now,
              updated_at: now,
              messages: turn,
            },
          );
          router.replace(
            paths.aiReports.conversation.getHref(response.conversation_id),
          );
        }
        setPendingQuestion(null);
        // Tri par activité + message_count de la sidebar.
        queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      },
      onError: (error) => {
        const isQuota =
          error instanceof Error &&
          'status' in error &&
          (error as { status?: number }).status === 429;
        setFlightError({
          id: newLocalId(),
          role: 'assistant',
          content: isQuota ? QUOTA_MESSAGE : GENERIC_ERROR_MESSAGE,
          timestamp: Date.now(),
          isError: true,
        });
        // Hors 429, le backend a persisté la question et le tour FAILED
        // (éventuellement dans une conversation créée à ce tour) : la sidebar
        // doit la faire apparaître même si ce fil-ci reste sur les bulles locales.
        if (!isQuota) {
          queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
        }
      },
    },
  });

  const handleSend = (question: string) => {
    if (askMutation.isPending) return;
    setFlightError(null);
    setPendingQuestion(question);
    askMutation.mutate({
      question,
      ...(isExisting ? { conversation_id: conversationId } : {}),
    });
  };

  if (isExisting && conversationQuery.isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isExisting && conversationQuery.isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Conversation introuvable ou supprimée.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href={paths.aiReports.chat.getHref()}>
            Nouvelle conversation
          </Link>
        </Button>
      </div>
    );
  }

  const serverMessages = (conversationQuery.data?.messages ?? []).map(
    toChatMessage,
  );
  const inFlight: ChatMessage[] = pendingQuestion
    ? [
        {
          id: 'in-flight-user',
          role: 'user',
          content: pendingQuestion,
          timestamp: Date.now(),
        },
        ...(flightError ? [flightError] : []),
      ]
    : [];
  const messages = [...serverMessages, ...inFlight];

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
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
  );
}
