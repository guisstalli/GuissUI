'use client';

import { SendHorizonal } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/form/textarea';
import { cn } from '@/utils/cn';

const MAX_QUESTION_LENGTH = 2000;
const COUNTER_THRESHOLD = 1800;

type ChatInputProps = {
  onSend: (question: string) => void;
  disabled?: boolean;
};

export function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('');

  const trimmed = value.trim();
  const canSend = !disabled && trimmed.length > 0;

  const submit = () => {
    if (!canSend) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
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
    </form>
  );
}
