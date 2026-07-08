'use client';

import { MessageSquarePlus, MoreHorizontal, Pencil, Trash } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/dialog/confirmation-dialog/confirmation-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown/dropdown';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Spinner } from '@/components/ui/spinner';
import { paths } from '@/config/paths';
import { cn } from '@/utils/cn';

import { useDeleteConversation } from '../../api/delete-conversation';
import { useConversations } from '../../api/get-conversations';
import { useRenameConversation } from '../../api/rename-conversation';
import type { ConversationListItem } from '../../types';

const SIDEBAR_PAGE_SIZE = 50;

type ConversationListProps = {
  activeConversationId?: number;
};

function ConversationRow({
  conversation,
  isActive,
  onDeleted,
}: {
  conversation: ConversationListItem;
  isActive: boolean;
  onDeleted: () => void;
}) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState(conversation.title);
  const renameInputRef = useRef<HTMLInputElement>(null);

  // Focus au passage en mode renommage (action explicite de l'utilisateur —
  // pas d'autoFocus au chargement de page, conforme jsx-a11y).
  useEffect(() => {
    if (isRenaming) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [isRenaming]);

  const renameMutation = useRenameConversation({
    mutationConfig: { onSuccess: () => setIsRenaming(false) },
  });
  const deleteMutation = useDeleteConversation({
    mutationConfig: { onSuccess: onDeleted },
  });

  const submitRename = () => {
    const title = draftTitle.trim();
    if (!title || title === conversation.title) {
      setIsRenaming(false);
      setDraftTitle(conversation.title);
      return;
    }
    renameMutation.mutate({ conversationId: conversation.id, title });
  };

  if (isRenaming) {
    return (
      <div className="px-1 py-0.5">
        <Input
          ref={renameInputRef}
          value={draftTitle}
          maxLength={255}
          className="h-8 text-sm"
          disabled={renameMutation.isPending}
          onChange={(event) => setDraftTitle(event.target.value)}
          onBlur={submitRename}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              submitRename();
            }
            if (event.key === 'Escape') {
              setIsRenaming(false);
              setDraftTitle(conversation.title);
            }
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'group flex items-center gap-1 rounded-md px-1 py-0.5',
        isActive ? 'bg-accent' : 'hover:bg-accent/60',
      )}
    >
      <Link
        href={paths.aiReports.conversation.getHref(conversation.id)}
        className="min-w-0 flex-1 px-2 py-1.5 text-sm"
        aria-current={isActive ? 'page' : undefined}
      >
        <span className="block truncate">
          {conversation.title || 'Conversation sans titre'}
        </span>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'size-7 shrink-0 opacity-0 focus-visible:opacity-100 group-hover:opacity-100',
              isActive && 'opacity-100',
            )}
          >
            <MoreHorizontal className="size-4" aria-hidden="true" />
            <span className="sr-only">Actions de la conversation</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem
            onSelect={() => {
              setDraftTitle(conversation.title);
              setIsRenaming(true);
            }}
          >
            <Pencil className="mr-2 size-4" aria-hidden="true" />
            Renommer
          </DropdownMenuItem>
          <ConfirmationDialog
            isDone={deleteMutation.isSuccess}
            icon="danger"
            title="Supprimer la conversation ?"
            body="La conversation et tous ses messages seront supprimés définitivement."
            cancelButtonText="Annuler"
            triggerButton={
              <DropdownMenuItem
                onSelect={(event) => event.preventDefault()}
                className="text-destructive focus:text-destructive"
              >
                <Trash className="mr-2 size-4" aria-hidden="true" />
                Supprimer
              </DropdownMenuItem>
            }
            confirmButton={
              <Button
                size="sm"
                variant="destructive"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(conversation.id)}
              >
                Supprimer
              </Button>
            }
          />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/**
 * Sidebar de l'assistant : historique des conversations (triées par activité
 * côté backend), création, renommage, suppression. Rendue par le layout du
 * segment /assistant-ia — elle persiste entre les navigations.
 */
export function ConversationList({
  activeConversationId,
}: ConversationListProps) {
  const router = useRouter();
  const { data, isLoading } = useConversations({
    params: { limit: SIDEBAR_PAGE_SIZE },
  });

  const conversations = data?.results ?? [];

  return (
    <div className="flex h-full min-h-0 flex-col gap-2">
      <Button asChild variant="outline" size="sm" className="justify-start">
        <Link href={paths.aiReports.chat.getHref()}>
          <MessageSquarePlus className="mr-2 size-4" aria-hidden="true" />
          Nouvelle conversation
        </Link>
      </Button>
      {isLoading ? (
        <div className="flex flex-1 items-center justify-center">
          <Spinner size="sm" />
        </div>
      ) : conversations.length === 0 ? (
        <p className="px-2 py-4 text-xs text-muted-foreground">
          Aucune conversation. Posez votre première question pour en créer une.
        </p>
      ) : (
        <ScrollArea className="min-h-0 flex-1">
          <nav
            aria-label="Historique des conversations"
            className="space-y-0.5 pr-2"
          >
            {conversations.map((conversation) => (
              <ConversationRow
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === activeConversationId}
                onDeleted={() => {
                  // Suppression de la conversation active → retour à l'accueil du chat.
                  if (conversation.id === activeConversationId) {
                    router.replace(paths.aiReports.chat.getHref());
                  }
                }}
              />
            ))}
          </nav>
        </ScrollArea>
      )}
    </div>
  );
}
