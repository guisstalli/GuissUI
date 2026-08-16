'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { paths } from '@/config/paths';
import { AssistantChat } from '@/features/ai-reports/components/chat/assistant-chat';

/**
 * Fil d'une conversation existante. `key` force la remise à zéro de l'état
 * local (bulles en vol) quand on navigue d'une conversation à l'autre.
 */
export default function ConversationPage() {
  const params = useParams<{ conversationId: string }>();
  const conversationId = Number(params.conversationId);
  const isValidId = Number.isInteger(conversationId) && conversationId > 0;

  if (!isValidId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          Conversation introuvable.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href={paths.aiReports.chat.getHref()}>
            Nouvelle conversation
          </Link>
        </Button>
      </div>
    );
  }

  return <AssistantChat key={conversationId} conversationId={conversationId} />;
}
