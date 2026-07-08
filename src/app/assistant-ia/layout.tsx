'use client';

import { useParams } from 'next/navigation';

import { AppShell as Shell } from '@/app/_shell';
import { Can } from '@/components/ui/can';
import { ConversationList } from '@/features/ai-reports/components/chat/conversation-list';

/**
 * Layout du segment /assistant-ia : la sidebar des conversations persiste
 * entre les navigations (nouvelle conversation ↔ fil existant), seul le fil
 * de droite change.
 */
export default function AssistantIaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Dans un layout client, useParams expose les params du segment actif :
  // présent sur /assistant-ia/[conversationId], absent sur /assistant-ia.
  const params = useParams<{ conversationId?: string }>();
  const parsedId = Number(params.conversationId);
  const activeConversationId =
    Number.isInteger(parsedId) && parsedId > 0 ? parsedId : undefined;

  return (
    <Can permission="ai-reports:generate">
      <Shell title="Assistant IA">
        <div className="flex h-[calc(100vh-9rem)] gap-3">
          <aside className="hidden w-64 shrink-0 md:flex md:flex-col">
            <ConversationList activeConversationId={activeConversationId} />
          </aside>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
        </div>
      </Shell>
    </Can>
  );
}
