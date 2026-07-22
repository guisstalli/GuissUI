'use client';

import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/utils/cn';

import { useChannelMessages } from '../api/get-messages';
import { CHANNEL_LABELS } from '../types';

/** Journal des 50 derniers messages entrants/sortants (rafraîchi toutes les 15 s). */
export function MessagesLog() {
  const messagesQuery = useChannelMessages();

  if (messagesQuery.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  const messages = messagesQuery.data ?? [];
  if (messages.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted-foreground">
        Aucun message pour le moment. Écrivez au numéro WhatsApp du centre pour
        démarrer une conversation.
      </p>
    );
  }

  return (
    <ul className="space-y-1.5">
      {messages.map((message) => (
        <li
          key={`${message.direction}-${message.id}`}
          className="flex items-start gap-2 rounded-md border border-border px-3 py-2 text-sm"
        >
          {message.direction === 'in' ? (
            <ArrowDownLeft
              className="mt-0.5 size-4 shrink-0 text-primary"
              aria-hidden
            />
          ) : (
            <ArrowUpRight
              className="mt-0.5 size-4 shrink-0 text-muted-foreground"
              aria-hidden
            />
          )}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <Badge variant="outline">{CHANNEL_LABELS[message.channel]}</Badge>
              <span className="font-mono">{message.peer}</span>
              <span>
                {new Date(message.created_at).toLocaleString('fr-FR')}
              </span>
              <span
                className={cn(
                  message.status === 'rejected' || message.status === 'failed'
                    ? 'text-destructive'
                    : 'text-muted-foreground',
                )}
              >
                {message.status}
              </span>
            </div>
            <p className="truncate">{message.body}</p>
            {message.error_message && (
              <p className="text-xs text-destructive">
                {message.error_message}
              </p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
