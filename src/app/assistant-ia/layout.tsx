'use client';

import { FileBarChart, MessageCircle, PanelLeft } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';

import { AppShell as Shell } from '@/app/_shell';
import { Button } from '@/components/ui/button';
import { Can } from '@/components/ui/can';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
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

  // Ouverture du tiroir mobile ; refermé à chaque changement de conversation.
  const [drawerOpen, setDrawerOpen] = useState(false);

  const asideContent = (
    <>
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
    </>
  );

  return (
    <Can permission="ai-reports:generate">
      <Shell title="Assistant IA">
        <div className="flex h-[calc(100vh-9rem)] gap-3">
          {/* Desktop : aside persistant. */}
          <aside className="hidden w-64 shrink-0 md:flex md:flex-col">
            {asideContent}
          </aside>
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            {/* Mobile : bouton d'ouverture du tiroir des conversations. */}
            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="mb-3 self-start md:hidden"
                >
                  <PanelLeft className="size-4" aria-hidden />
                  Conversations
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="w-72 p-4"
                onClick={() => setDrawerOpen(false)}
              >
                <SheetHeader className="p-0">
                  <SheetTitle>Conversations</SheetTitle>
                </SheetHeader>
                <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
                  {asideContent}
                </div>
              </SheetContent>
            </Sheet>
            {children}
          </div>
        </div>
      </Shell>
    </Can>
  );
}
