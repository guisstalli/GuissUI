'use client';

import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';

import { useChat } from '../../api/chat';
import { streamChat } from '../../api/chat-stream';
import {
  getConversationQueryOptions,
  useConversation,
} from '../../api/get-conversation';
import type {
  ChatMessage,
  ChatResponse,
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
  response: ChatResponse,
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
      sources: null,
      sources_display: null,
      verification: null,
      tools_used: response.tools_used,
      trajectory: response.trajectory,
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
  // Streaming (SSE) : progression affichée + drapeau d'envoi en cours.
  const [streaming, setStreaming] = useState(false);
  const [streamStatus, setStreamStatus] = useState<string | null>(null);

  // Réconciliation du cache après un tour réussi — partagée par le streaming
  // (événement `done`) et le repli synchrone (mutation onSuccess).
  const applyTurn = useCallback(
    (question: string, response: ChatResponse) => {
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
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
    },
    [isExisting, conversationId, queryClient, router],
  );

  const chatMutation = useChat({
    mutationConfig: {
      onSuccess: (response) => {
        applyTurn(pendingQuestion ?? '', response);
      },
      onError: (error) => {
        const status =
          error instanceof Error && 'status' in error
            ? (error as { status?: number }).status
            : undefined;
        const isQuota = status === 429;
        // 400 = erreur métier lisible (budget de conversation atteint, pièce
        // jointe invalide…) : afficher le message du backend tel quel.
        const content = isQuota
          ? QUOTA_MESSAGE
          : status === 400 && error.message
            ? error.message
            : GENERIC_ERROR_MESSAGE;
        setFlightError({
          id: newLocalId(),
          role: 'assistant',
          content,
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

  const showBusinessError = (message: string) => {
    setFlightError({
      id: newLocalId(),
      role: 'assistant',
      content: message || GENERIC_ERROR_MESSAGE,
      timestamp: Date.now(),
      isError: true,
    });
    queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
  };

  const handleSend = async (question: string, attachments: File[]) => {
    if (chatMutation.isPending || streaming) return;
    setFlightError(null);
    setPendingQuestion(question);
    setStreaming(true);
    setStreamStatus('L’assistant réfléchit…');
    try {
      const response = await streamChat({
        question,
        ...(attachments.length > 0 ? { attachments } : {}),
        ...(isExisting ? { conversation_id: conversationId } : {}),
        onEvent: (e) => {
          if (e.type === 'tools' && e.tools.length) {
            setStreamStatus(`Analyse en cours : ${e.tools.join(', ')}…`);
          } else if (e.type === 'step') {
            setStreamStatus('L’assistant réfléchit…');
          }
        },
      });
      applyTurn(question, response);
    } catch (err) {
      const business =
        err instanceof Error &&
        (err as Error & { business?: boolean }).business === true;
      if (business) {
        // Erreur métier (budget/quota/indispo) : afficher, ne PAS relancer.
        showBusinessError((err as Error).message);
      } else {
        // Streaming indisponible (réseau/proxy) : repli sur le chat synchrone.
        chatMutation.mutate({
          question,
          ...(attachments.length > 0 ? { attachments } : {}),
          ...(isExisting ? { conversation_id: conversationId } : {}),
        });
      }
    } finally {
      setStreaming(false);
      setStreamStatus(null);
    }
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
          isThinking={chatMutation.isPending || streaming}
        />
        <div className="border-t border-border p-3">
          {streaming && streamStatus && (
            <p className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Spinner className="size-3" />
              {streamStatus}
            </p>
          )}
          <ChatInput
            onSend={handleSend}
            disabled={chatMutation.isPending || streaming}
          />
        </div>
      </div>
    </div>
  );
}
