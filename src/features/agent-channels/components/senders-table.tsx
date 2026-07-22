'use client';

import { MessageCircle, Trash2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/form';
import { useNotifications } from '@/components/ui/notifications';
import { Spinner } from '@/components/ui/spinner';

import { useDeleteSender } from '../api/delete-sender';
import { useSenders } from '../api/get-senders';
import { useUpdateSender } from '../api/update-sender';
import { CHANNEL_LABELS } from '../types';

/** Table des identités autorisées : droits modifiables en place, révocation. */
export function SendersTable() {
  const sendersQuery = useSenders();
  const updateMutation = useUpdateSender();
  const deleteMutation = useDeleteSender();
  const { addNotification } = useNotifications();

  if (sendersQuery.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  const senders = sendersQuery.data ?? [];
  if (senders.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
        <MessageCircle className="size-8 text-muted-foreground" aria-hidden />
        <p className="text-sm text-muted-foreground">
          Aucune identité autorisée. Ajoutez un numéro WhatsApp ou une adresse
          email pour ouvrir la discussion avec l&apos;assistant.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-3 py-2">Canal</th>
            <th className="px-3 py-2">Identité</th>
            <th className="px-3 py-2">Compte lié</th>
            <th className="px-3 py-2">Discussion</th>
            <th className="px-3 py-2">Actions sensibles</th>
            <th className="px-3 py-2" aria-label="Révoquer" />
          </tr>
        </thead>
        <tbody>
          {senders.map((sender) => (
            <tr key={sender.id} className="border-t border-border">
              <td className="px-3 py-2">
                <Badge variant="outline">
                  {CHANNEL_LABELS[sender.channel]}
                </Badge>
              </td>
              <td className="px-3 py-2 font-mono text-xs">
                {sender.identifier}
              </td>
              <td className="px-3 py-2">{sender.user_email}</td>
              <td className="px-3 py-2">
                <Switch
                  checked={sender.can_chat}
                  aria-label={`Discussion pour ${sender.identifier}`}
                  onCheckedChange={(checked) =>
                    updateMutation.mutate({
                      senderId: sender.id,
                      can_chat: checked,
                    })
                  }
                />
              </td>
              <td className="px-3 py-2">
                <Switch
                  checked={sender.can_trigger_actions}
                  aria-label={`Actions sensibles pour ${sender.identifier}`}
                  onCheckedChange={(checked) =>
                    updateMutation.mutate({
                      senderId: sender.id,
                      can_trigger_actions: checked,
                    })
                  }
                />
              </td>
              <td className="px-3 py-2 text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={`Révoquer ${sender.identifier}`}
                  onClick={() =>
                    deleteMutation.mutate(sender.id, {
                      onSuccess: () =>
                        addNotification({
                          type: 'success',
                          title: 'Identité révoquée',
                        }),
                    })
                  }
                >
                  <Trash2 className="size-4 text-destructive" aria-hidden />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
