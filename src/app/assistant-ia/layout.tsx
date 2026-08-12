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
import { CAPABILITY } from '@/lib/capabilities';

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

  // `capability` explicite : le backend garde le chat par `ai.chat.access`,
  // pas par la génération de rapports. Sans elle, `Can` retombait sur le rôle
  // statique — la barre latérale masquait bien l'entrée après révocation, mais
  // l'URL saisie directement affichait quand même la coquille du chat, les
  // appels API échouant ensuite en 403.
  return (
    <Can
      permission="ai-reports:generate"
      capability={CAPABILITY.AI_CHAT_ACCESS}
    >
      <Shell title="Assistant IA">
        {/* `h-full` et non `h-[calc(100vh-9rem)]` : cette hauteur était une
            DEVINETTE — 9rem censés couvrir l'en-tête et les marges du shell,
            qui valent en réalité 6,5rem (56px d'en-tête + 48px de `p-6`).
            Le conteneur ne coïncidait donc jamais avec l'espace disponible :
            trop court, il laissait un vide sous la discussion, et le moindre
            écart faisait défiler le conteneur entier au lieu du seul fil.
            Le `main` du shell a une hauteur définie (`flex-1` dans une colonne
            contrainte, shell.tsx:35-40) : `h-full` s'y ajuste exactement et
            suivra toute modification future de l'en-tête sans recalcul. */}
        <div className="flex h-full min-h-0 gap-3">
          {/* Desktop : aside persistant.
              `min-h-0 overflow-y-auto` est indispensable, pas cosmétique :
              sans lui la liste des conversations grandit sans limite et pousse
              le conteneur au-delà de sa boîte, ce qui fait défiler tout le
              shell au lieu du seul fil de discussion. La version mobile de
              cette même liste (dans le SheetContent ci-dessous) avait déjà son
              propre scroll — l'aside desktop était le seul à en manquer. */}
          <aside className="hidden min-h-0 w-64 shrink-0 overflow-y-auto md:flex md:flex-col">
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
