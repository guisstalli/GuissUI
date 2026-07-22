'use client';

import { FileBarChart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import { AppShell as Shell } from '@/app/_shell';
import { Can } from '@/components/ui/can';
import { paths } from '@/config/paths';
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
            <Can permission="admin:agent-channels">
              <Link
                href={paths.agentChannels.manage.getHref()}
                className="mt-2 flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MessageCircle className="size-4" aria-hidden />
                Canaux (WhatsApp, email)
              </Link>
            </Can>
            <Can permission="ai-reports:view">
              <Link
                href={paths.aiReports.list.getHref()}
                className="mt-2 flex items-center gap-2 rounded-md border border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <FileBarChart className="size-4" aria-hidden />
                Rapports générés
              </Link>
            </Can>
          </aside>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">{children}</div>
        </div>
      </Shell>
    </Can>
  );
}
