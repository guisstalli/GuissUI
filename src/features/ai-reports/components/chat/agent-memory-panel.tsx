'use client';

import { Brain, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/dialog/confirmation-dialog/confirmation-dialog';
import { useNotifications } from '@/components/ui/notifications';

import { useAgentMemory, useClearAgentMemory } from '../../api/agent-memory';

/**
 * Ce que l'agent a retenu, et le bouton pour le lui faire oublier.
 *
 * Il réinjecte ces préférences dans ses prochaines conversations : une consigne
 * donnée un jour orientait les réponses des semaines plus tard, sans qu'on
 * puisse la retrouver ni la retirer.
 */
export function AgentMemoryPanel() {
  const { addNotification } = useNotifications();
  const { data, isLoading } = useAgentMemory();
  const { mutate: oublier, isPending } = useClearAgentMemory({
    onSuccess: () =>
      addNotification({
        type: 'success',
        title: 'Mémoire effacée',
        message: 'L’assistant repart sans préférence enregistrée.',
      }),
  });

  const notes = data?.notes ?? [];
  if (isLoading || notes.length === 0) return null;

  return (
    <section
      aria-label="Préférences retenues par l’assistant"
      className="rounded-md border border-border p-2"
    >
      <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Brain className="size-3.5" aria-hidden />
        Ce que l’assistant a retenu
      </p>
      <ul className="space-y-0.5">
        {notes.map((note) => (
          <li key={note} className="text-xs text-muted-foreground">
            • {note}
          </li>
        ))}
      </ul>
      <ConfirmationDialog
        icon="danger"
        title="Tout faire oublier ?"
        body="L’assistant repartira sans aucune préférence enregistrée pour vous."
        cancelButtonText="Annuler"
        isDone={!isPending}
        triggerButton={
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 h-6 px-1.5 text-xs"
            disabled={isPending}
          >
            <Trash2 className="mr-1 size-3" aria-hidden />
            Tout oublier
          </Button>
        }
        confirmButton={
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => oublier()}
          >
            Tout oublier
          </Button>
        }
      />
    </section>
  );
}
