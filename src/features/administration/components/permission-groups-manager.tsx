'use client';

import { KeyRound, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ConfirmationDialog } from '@/components/ui/dialog/confirmation-dialog/confirmation-dialog';
import { useNotifications } from '@/components/ui/notifications';
import { Spinner } from '@/components/ui/spinner';

import { useDeletePermissionGroup } from '../api/delete-permission-group';
import { usePermissionGroups } from '../api/get-permission-groups';
import type { PermissionGroup } from '../types/schemas';

import { PermissionGroupFormDialog } from './permission-group-form-dialog';

export function PermissionGroupsManager() {
  const groupsQuery = usePermissionGroups();
  const deleteMutation = useDeletePermissionGroup();
  const { addNotification } = useNotifications();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PermissionGroup | undefined>(
    undefined,
  );

  const openCreate = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  const openEdit = (group: PermissionGroup) => {
    setEditing(group);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Groupes de permissions et capacités serveur associées.
        </p>
        <Button size="sm" onClick={openCreate}>
          <Plus className="mr-1.5 size-4" aria-hidden="true" />
          Nouveau groupe
        </Button>
      </div>

      {groupsQuery.isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner size="md" />
        </div>
      ) : groupsQuery.isError ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border text-center text-muted-foreground">
          <KeyRound className="size-10 text-destructive" />
          <p className="text-sm">Impossible de charger les groupes.</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => groupsQuery.refetch()}
          >
            Réessayer
          </Button>
        </div>
      ) : !groupsQuery.data || groupsQuery.data.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border text-center text-muted-foreground">
          <KeyRound className="size-10" />
          <p className="text-sm">Aucun groupe de permissions.</p>
          <Button variant="ghost" size="sm" onClick={openCreate}>
            Créer le premier groupe
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groupsQuery.data.map((group) => (
            <Card key={group.id} className="flex flex-col">
              <CardContent className="flex flex-1 flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                      {group.name}
                    </p>
                    {group.description && (
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {group.description}
                      </p>
                    )}
                  </div>
                  {group.is_system && (
                    <Badge variant="secondary" className="shrink-0">
                      Système
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <KeyRound className="size-3.5" aria-hidden="true" />
                    {group.capabilities.length} capacité
                    {group.capabilities.length > 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="size-3.5" aria-hidden="true" />
                    {group.user_ids.length} membre
                    {group.user_ids.length > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="mt-auto flex items-center justify-end gap-1 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(group)}
                  >
                    <Pencil className="mr-1.5 size-3.5" aria-hidden="true" />
                    Modifier
                  </Button>
                  {!group.is_system && (
                    <ConfirmationDialog
                      isDone={deleteMutation.isSuccess}
                      icon="danger"
                      title="Supprimer ce groupe ?"
                      body={`Le groupe « ${group.name} » et ses attributions de capacités seront supprimés.`}
                      triggerButton={
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Supprimer ${group.name}`}
                        >
                          <Trash2
                            className="size-4 text-destructive"
                            aria-hidden="true"
                          />
                        </Button>
                      }
                      confirmButton={
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={deleteMutation.isPending}
                          onClick={() =>
                            deleteMutation.mutate(group.id, {
                              onSuccess: () =>
                                addNotification({
                                  type: 'success',
                                  title: 'Groupe supprimé',
                                }),
                            })
                          }
                        >
                          Supprimer
                        </Button>
                      }
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PermissionGroupFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        group={editing}
      />
    </div>
  );
}
