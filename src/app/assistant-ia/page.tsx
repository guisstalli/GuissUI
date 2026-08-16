'use client';

import { AssistantChat } from '@/features/ai-reports/components/chat/assistant-chat';

/**
 * Nouvelle conversation : le premier envoi crée le fil côté backend puis
 * redirige vers /assistant-ia/[id] (cache déjà semé — montage sans flash).
 * Permission + sidebar portées par le layout du segment.
 */
export default function AssistantIaPage() {
  return <AssistantChat />;
}
