'use client';

import { MessageCircle, Trash2 } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/dialog/confirmation-dialog/confirmation-dialog';
import { Switch } from '@/components/ui/form';
import { Input } from '@/components/ui/form/input';
import { useNotifications } from '@/components/ui/notifications';
import { Spinner } from '@/components/ui/spinner';

import { useDeleteSender } from '../api/delete-sender';
import { useSenders } from '../api/get-senders';
import { useUpdateSender } from '../api/update-sender';
import { CHANNEL_LABELS, type AllowedSender } from '../types';

/** Table des identités autorisées : droits modifiables en place, révocation. */
export function SendersTable() {
  const sendersQuery = useSenders();
  const updateMutation = useUpdateSender();
  const deleteMutation = useDeleteSender();
  const { addNotification } = useNotifications();
  // Filtrage CÔTÉ CLIENT, à dessein : la liste des identités autorisées se
  // compte en dizaines, pas en milliers. Un aller-retour serveur par frappe
  // coûterait plus qu'il ne rapporte.
  const [recherche, setRecherche] = useState('');

  if (sendersQuery.isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner />
      </div>
    );
  }

  if (sendersQuery.isError) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border py-10 text-center">
        <p className="text-sm text-destructive">
          Impossible de charger les identités autorisées.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => sendersQuery.refetch()}
          disabled={sendersQuery.isFetching}
        >
          Réessayer
        </Button>
      </div>
    );
  }

  const senders = sendersQuery.data ?? [];
  const terme = recherche.trim().toLowerCase();
  const sendersFiltres = terme
    ? senders.filter(
        (s) =>
          s.identifier.toLowerCase().includes(terme) ||
          s.user_email.toLowerCase().includes(terme),
      )
    : senders;

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
    <div className="space-y-3">
      <div className="flex flex-col gap-1">
        <label
          htmlFor="recherche-identite"
          className="text-xs text-muted-foreground"
        >
          Rechercher une identité
        </label>
        <Input
          id="recherche-identite"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Numéro, adresse email ou compte lié"
          className="h-9 max-w-md"
        />
      </div>

      {sendersFiltres.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
          Aucune identité ne correspond à « {recherche} ».
        </p>
      ) : (
        <SendersTableBody
          senders={sendersFiltres}
          updateMutation={updateMutation}
          deleteMutation={deleteMutation}
          addNotification={addNotification}
        />
      )}
    </div>
  );
}

type SendersTableBodyProps = {
  senders: AllowedSender[];
  updateMutation: ReturnType<typeof useUpdateSender>;
  deleteMutation: ReturnType<typeof useDeleteSender>;
  addNotification: (notification: {
    type: 'info' | 'warning' | 'success' | 'error';
    title: string;
    message?: string;
  }) => void;
};

function SendersTableBody({
  senders,
  updateMutation,
  deleteMutation,
  addNotification,
}: SendersTableBodyProps) {
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
                <ConfirmationDialog
                  isDone={deleteMutation.isPending}
                  icon="danger"
                  title="Révoquer cette identité ?"
                  body={`${sender.identifier} ne pourra plus discuter avec l'assistant tant qu'elle n'est pas réautorisée.`}
                  triggerButton={
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Révoquer ${sender.identifier}`}
                    >
                      <Trash2 className="size-4 text-destructive" aria-hidden />
                    </Button>
                  }
                  confirmButton={
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={deleteMutation.isPending}
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
                      Révoquer
                    </Button>
                  }
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
