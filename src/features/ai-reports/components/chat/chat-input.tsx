'use client';

import { Paperclip, SendHorizonal, X } from 'lucide-react';
import { useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/form/textarea';
import { cn } from '@/utils/cn';

import {
  CHAT_ATTACHMENT_ACCEPT,
  CHAT_MAX_ATTACHMENT_BYTES,
  CHAT_MAX_ATTACHMENTS,
} from '../../types';

const MAX_QUESTION_LENGTH = 2000;
const COUNTER_THRESHOLD = 1800;

type ChatInputProps = {
  onSend: (question: string, attachments: File[]) => void;
  disabled?: boolean;
};

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
    : `${Math.max(1, Math.round(bytes / 1024))} Ko`;

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [attachmentError, setAttachmentError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const trimmed = value.trim();
  const canSend = !disabled && trimmed.length > 0;

  const submit = () => {
    if (!canSend) return;
    onSend(trimmed, attachments);
    setValue('');
    setAttachments([]);
    setAttachmentError(null);
  };

  const addFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setAttachmentError(null);
    const next = [...attachments];
    for (const file of Array.from(files)) {
      if (next.length >= CHAT_MAX_ATTACHMENTS) {
        setAttachmentError(
          `Maximum ${CHAT_MAX_ATTACHMENTS} pièces jointes par message.`,
        );
        break;
      }
      if (file.size > CHAT_MAX_ATTACHMENT_BYTES) {
        setAttachmentError(
          `« ${file.name} » dépasse la limite de 8 Mo par fichier.`,
        );
        continue;
      }
      next.push(file);
    }
    setAttachments(next);
  };

  return (
    <form
      className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      {(attachments.length > 0 || attachmentError) && (
        <div className="space-y-1">
          {attachments.length > 0 && (
            <ul className="flex flex-wrap gap-1.5">
              {attachments.map((file, index) => (
                <li
                  key={`${file.name}-${index}`}
                  className="bg-muted/60 inline-flex items-center gap-1.5 rounded-full border border-border py-0.5 pl-2.5 pr-1 text-xs"
                >
                  <span className="max-w-40 truncate">{file.name}</span>
                  <span className="text-muted-foreground">
                    {formatSize(file.size)}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setAttachments((prev) =>
                        prev.filter((_, i) => i !== index),
                      )
                    }
                    className="rounded-full p-0.5 transition-colors hover:bg-muted"
                    aria-label={`Retirer ${file.name}`}
                  >
                    <X className="size-3" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {attachmentError && (
            <p className="text-xs text-destructive">{attachmentError}</p>
          )}
        </div>
      )}
      <div className="flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={CHAT_ATTACHMENT_ACCEPT}
          className="hidden"
          aria-label="Joindre des fichiers"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = '';
          }}
        />
        <Button
          type="button"
          size="icon"
          variant="outline"
          disabled={disabled || attachments.length >= CHAT_MAX_ATTACHMENTS}
          onClick={() => fileInputRef.current?.click()}
          aria-label="Joindre un fichier (image ou document)"
        >
          <Paperclip className="size-4" />
        </Button>
        <div className="relative flex-1">
          <Textarea
            value={value}
            onChange={(event) =>
              setValue(event.target.value.slice(0, MAX_QUESTION_LENGTH))
            }
            onKeyDown={(event) => {
              // Entrée = envoyer ; Maj+Entrée = nouvelle ligne
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder="Votre question analytique… (Entrée pour envoyer)"
            aria-label="Question à l'assistant IA"
            rows={2}
            className="max-h-40 resize-none pr-16"
            disabled={disabled}
          />
          {value.length >= COUNTER_THRESHOLD && (
            <span
              className={cn(
                'absolute bottom-2 right-3 text-[11px] tabular-nums',
                value.length >= MAX_QUESTION_LENGTH
                  ? 'text-destructive'
                  : 'text-muted-foreground',
              )}
            >
              {value.length}/{MAX_QUESTION_LENGTH}
            </span>
          )}
        </div>
        <Button
          type="submit"
          size="icon"
          disabled={!canSend}
          aria-label="Envoyer"
        >
          <SendHorizonal className="size-4" />
        </Button>
      </div>
    </form>
  );
}
