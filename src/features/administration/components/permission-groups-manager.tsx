'use client';

import { KeyRound, Lock, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/dialog/confirmation-dialog/confirmation-dialog';
import { useNotifications } from '@/components/ui/notifications';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/utils/cn';

import { useDeletePermissionGroup } from '../api/delete-permission-group';
import { useCapabilityRegistry } from '../api/get-capability-registry';
import { usePermissionGroups } from '../api/get-permission-groups';
import type { PermissionGroup } from '../types/schemas';

import { PermissionGroupFormDialog } from './permission-group-form-dialog';

const CATEGORIES: Record<string, string> = {
  dossiers: 'Dossiers',
  examens: 'Examens',
  activite: 'Activité',
  configuration: 'Configuration',
  analytique: 'Analytique',
  facturation: 'Facturation',
  ia: 'IA',
  administration: 'Administration',
};

/**
 * Gestion des groupes de permissions.
 *
 * L'ancienne version alignait des cartes uniformes annonçant « 5 capacités » —
 * un COMPTE. Or la question qu'on se pose devant cet écran est
 * « lesquelles ? ». Un chiffre oblige à ouvrir chaque groupe un par un pour le
 * découvrir.
 *
 * Les capacités sont donc affichées, groupées par domaine. La composition est
 * une LISTE et non une grille : les groupes n'ont pas tous le même poids, et
 * une grille de cartes égales le nierait. Le nom domine, les capacités
 * occupent le corps, les compteurs restent en marge.
 */
export function PermissionGroupsManager() {
  const groupsQuery = usePermissionGroups();
  const registryQuery = useCapabilityRegistry();
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

  /** Code technique → libellé et catégorie, via le registre serveur. */
  const meta = (code: string) => {
    const item = registryQuery.data?.find((c) => c.code === code);
    return { label: item?.label ?? code, category: item?.category ?? 'autre' };
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-foreground">
            Groupes de permissions
          </h2>
          <p className="mt-0.5 max-w-prose text-sm text-muted-foreground">
            Un groupe accorde des capacités <strong>en plus</strong> de celles
            du rôle. Il n&apos;en retire jamais.
          </p>
        </div>
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
          <p className="max-w-sm text-xs">
            Un groupe permet d&apos;accorder une capacité à quelques
            utilisateurs précis, sans toucher au rôle des autres.
          </p>
          <Button variant="ghost" size="sm" onClick={openCreate}>
            Créer le premier groupe
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-border border-y border-border">
          {groupsQuery.data.map((group) => {
            // Regroupement par domaine : douze puces à plat sont illisibles,
            // les mêmes rangées par catégorie se lisent d'un coup d'œil.
            const parCategorie = new Map<string, string[]>();
            for (const code of group.capabilities) {
              const { label, category } = meta(code);
              parCategorie.set(category, [
                ...(parCategorie.get(category) ?? []),
                label,
              ]);
            }

            return (
              <li
                key={group.id}
                className="group/row grid gap-x-6 gap-y-3 py-4 md:grid-cols-[minmax(0,15rem)_1fr_auto]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate font-semibold text-foreground">
                      {group.name}
                    </h3>
                    {group.is_system && (
                      <span
                        className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-1.5 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider text-muted-foreground"
                        title="Groupe interne — non supprimable"
                      >
                        <Lock className="size-2.5" aria-hidden="true" />
                        Système
                      </span>
                    )}
                  </div>
                  {group.description && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {group.description}
                    </p>
                  )}
                  <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Users className="size-3.5" aria-hidden="true" />
                    {group.user_ids.length} membre
                    {group.user_ids.length > 1 ? 's' : ''}
                  </p>
                </div>

                <div className="min-w-0">
                  {group.capabilities.length === 0 ? (
                    <p className="text-xs italic text-muted-foreground">
                      Aucune capacité — ce groupe n&apos;accorde rien.
                    </p>
                  ) : (
                    <div className="space-y-1.5">
                      {Array.from(parCategorie.entries()).map(
                        ([category, labels]) => (
                          <div
                            key={category}
                            className="flex flex-wrap items-baseline gap-x-2 gap-y-1"
                          >
                            <span className="w-24 shrink-0 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground">
                              {CATEGORIES[category] ?? category}
                            </span>
                            {labels.map((label) => (
                              <span
                                key={label}
                                className="bg-primary/10 rounded px-1.5 py-0.5 text-xs text-foreground"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>

                <div
                  className={cn(
                    'flex items-start justify-end gap-1',
                    // Les actions restent atteignables au clavier et au
                    // toucher : l'estompe ne concerne que le pointeur.
                    'md:opacity-60 md:transition-opacity',
                    'md:focus-within:opacity-100 md:group-hover/row:opacity-100',
                  )}
                >
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
              </li>
            );
          })}
        </ul>
      )}

      <PermissionGroupFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        group={editing}
      />
    </div>
  );
}
