import { getSession } from 'next-auth/react';

import { env } from '@/config/env';

import type { ChatResponse } from '../types';

type StreamEvent =
  | { type: 'start'; conversation_id: number }
  | { type: 'step'; index: number }
  | { type: 'tools'; index: number; tools: string[] }
  | { type: 'done'; payload: ChatResponse }
  | { type: 'error'; message: string };

type StreamChatInput = {
  question: string;
  filters?: Record<string, unknown>;
  conversation_id?: number;
  attachments?: File[];
  onEvent: (event: StreamEvent) => void;
  signal?: AbortSignal;
};

/**
 * Chat agentique en STREAMING (SSE via fetch). Émet les événements de
 * progression (start/step/tools) puis résout avec le payload `done` (même forme
 * que postChat). Lève sur `error` ou échec réseau — l'appelant peut alors se
 * rabattre sur le chat synchrone.
 */
export async function streamChat({
  question,
  filters,
  conversation_id,
  attachments,
  onEvent,
  signal,
}: StreamChatInput): Promise<ChatResponse> {
  const token = (await getSession())?.accessToken ?? null;
  const url = `${env.API_URL}/ai-reports/chat/stream/`;

  let body: BodyInit;
  const headers: Record<string, string> = {
    Accept: 'text/event-stream',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
  if (attachments && attachments.length > 0) {
    const form = new FormData();
    form.append('question', question);
    form.append('filters', JSON.stringify(filters ?? {}));
    if (conversation_id !== undefined) {
      form.append('conversation_id', String(conversation_id));
    }
    for (const f of attachments) form.append('attachments', f);
    body = form; // le navigateur pose le Content-Type multipart
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify({
      question,
      filters: filters ?? {},
      ...(conversation_id !== undefined ? { conversation_id } : {}),
    });
  }

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body,
    credentials: 'include',
    signal,
  });

  if (!response.ok || !response.body) {
    throw new Error(`Streaming indisponible (${response.status})`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let done: ChatResponse | null = null;

  // Parse SSE : blocs séparés par une ligne vide, lignes `event:`/`data:`.
  const handleBlock = (block: string) => {
    let eventName = 'message';
    const dataLines: string[] = [];
    for (const line of block.split('\n')) {
      if (line.startsWith('event:')) eventName = line.slice(6).trim();
      else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
    }
    if (dataLines.length === 0) return;
    const data = JSON.parse(dataLines.join('\n'));
    if (eventName === 'done') {
      done = data as ChatResponse;
      onEvent({ type: 'done', payload: data as ChatResponse });
    } else if (eventName === 'error') {
      onEvent({ type: 'error', message: data.message });
      // Erreur MÉTIER (budget, quota, indisponibilité) émise par le backend :
      // à afficher telle quelle, PAS de repli synchrone (éviter un double run).
      const err = new Error(
        data.message || 'Erreur du service IA.',
      ) as Error & {
        business?: boolean;
      };
      err.business = true;
      throw err;
    } else if (eventName === 'start') {
      onEvent({ type: 'start', conversation_id: data.conversation_id });
    } else if (eventName === 'step') {
      onEvent({ type: 'step', index: data.index });
    } else if (eventName === 'tools') {
      onEvent({ type: 'tools', index: data.index, tools: data.tools });
    }
  };

  for (;;) {
    const { value, done: streamDone } = await reader.read();
    if (streamDone) break;
    buffer += decoder.decode(value, { stream: true });
    let sep: number;
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const block = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      if (block.trim()) handleBlock(block);
    }
  }

  if (!done) throw new Error('Flux interrompu avant la réponse finale.');
  return done;
}
