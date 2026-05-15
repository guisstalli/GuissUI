'use client';

import {
  ClipboardList,
  MoreHorizontal,
  PowerOff,
  Trash,
  Trash2,
  Zap,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Can } from '@/components/ui/can/can';
import { ConfirmationDialog } from '@/components/ui/dialog/confirmation-dialog/confirmation-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown/dropdown';
import { useNotifications } from '@/components/ui/notifications';

import { useDeleteUser } from '../api/delete-user';
import { useHardDeleteUser } from '../api/hard-delete-user';
import { useToggleActive } from '../api/toggle-active';
import type { UserListItem } from '../types/schemas';

import { AuditLogDialog } from './audit-log-dialog';

interface UserRowActionsProps {
  user: UserListItem;
}

export function UserRowActions({ user }: UserRowActionsProps) {
  const { addNotification } = useNotifications();

  const { mutate: toggleActive, isPending: isToggling } = useToggleActive({
    onSuccess: () =>
      addNotification({
        type: 'success',
        title: user.is_active ? 'Compte désactivé' : 'Compte activé',
      }),
  });

  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser({
    onSuccess: () =>
      addNotification({ type: 'success', title: 'Utilisateur supprimé' }),
  });

  const { mutate: hardDeleteUser, isPending: isHardDeleting } =
    useHardDeleteUser({
      onSuccess: () =>
        addNotification({
          type: 'success',
          title: 'Utilisateur supprimé définitivement',
        }),
    });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="size-8">
          <MoreHorizontal className="size-4" aria-hidden="true" />
          <span className="sr-only">Actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {/* Audit log */}
        <AuditLogDialog
          user={user}
          trigger={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <ClipboardList className="mr-2 size-4" aria-hidden="true" />
              Journal d&apos;audit
            </DropdownMenuItem>
          }
        />

        <DropdownMenuSeparator />

        {/* Toggle active */}
        <ConfirmationDialog
          isDone={isToggling}
          icon="info"
          title={
            user.is_active ? 'Désactiver le compte ?' : 'Activer le compte ?'
          }
          body={
            user.is_active
              ? "L'utilisateur ne pourra plus se connecter."
              : "L'utilisateur pourra à nouveau se connecter."
          }
          triggerButton={
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              {user.is_active ? (
                <>
                  <PowerOff className="mr-2 size-4" aria-hidden="true" />
                  Désactiver
                </>
              ) : (
                <>
                  <Zap className="mr-2 size-4" aria-hidden="true" />
                  Activer
                </>
              )}
            </DropdownMenuItem>
          }
          confirmButton={
            <Button
              size="sm"
              variant={user.is_active ? 'destructive' : 'default'}
              onClick={() =>
                toggleActive({ id: user.id, is_active: !user.is_active })
              }
              disabled={isToggling}
            >
              Confirmer
            </Button>
          }
        />

        {/* Soft delete */}
        <ConfirmationDialog
          isDone={isDeleting}
          icon="danger"
          title="Supprimer l'utilisateur ?"
          body="L'utilisateur sera désactivé et masqué. Cette action peut être annulée."
          triggerButton={
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
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
              onClick={() => deleteUser(user.id)}
              disabled={isDeleting}
            >
              Supprimer
            </Button>
          }
        />

        {/* Hard delete — admin only */}
        <Can permission="admin:users">
          <ConfirmationDialog
            isDone={isHardDeleting}
            icon="danger"
            title="Suppression définitive ?"
            body="⚠️ Cette action est IRRÉVERSIBLE. Toutes les données seront effacées."
            triggerButton={
              <DropdownMenuItem
                onSelect={(e) => e.preventDefault()}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 size-4" aria-hidden="true" />
                Supprimer définitivement
              </DropdownMenuItem>
            }
            confirmButton={
              <Button
                size="sm"
                variant="destructive"
                onClick={() => hardDeleteUser(user.id)}
                disabled={isHardDeleting}
              >
                Supprimer définitivement
              </Button>
            }
          />
        </Can>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
