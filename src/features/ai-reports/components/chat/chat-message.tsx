'use client';

import { AlertCircle, Bot } from 'lucide-react';

import { cn } from '@/utils/cn';

import type { ChatMessage as ChatMessageType } from '../../types';
import { MarkdownContent } from '../markdown-content';

import { ChatSourcesAccordion } from './chat-sources-accordion';
import { ChatTrajectoryAccordion } from './chat-trajectory-accordion';

type ChatMessageProps = {
  message: ChatMessageType;
};

export function ChatMessage({ message }: ChatMessageProps) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>
      </div>
    );
  }

  if (message.isError) {
    return (
      <div className="flex justify-start">
        <div className="border-destructive/30 bg-destructive/10 flex max-w-[85%] items-start gap-2 rounded-2xl rounded-bl-sm border px-4 py-2.5 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <p>{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start gap-2">
      <div
        className={cn(
          'flex size-7 shrink-0 items-center justify-center rounded-full',
          'bg-primary/10 text-primary',
        )}
        aria-hidden
      >
        <Bot className="size-4" />
      </div>
      <div className="min-w-0 max-w-[85%] space-y-1 rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-2.5 shadow-sm">
        <MarkdownContent content={message.content} />
        <ChatSourcesAccordion
          sources={message.sources}
          sources_display={message.sources_display}
          tools_used={message.tools_used}
        />
        <ChatTrajectoryAccordion trajectory={message.trajectory} />
      </div>
    </div>
  );
}
