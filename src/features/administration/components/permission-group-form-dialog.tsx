'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form/form';
import { Input } from '@/components/ui/form/input';
import { useNotifications } from '@/components/ui/notifications';

import { useCreatePermissionGroup } from '../api/create-permission-group';
import { useCapabilityRegistry } from '../api/get-capability-registry';
import { useUserOptions } from '../api/get-users';
import { useSetGroupCapabilities } from '../api/set-group-capabilities';
import { useSetGroupUsers } from '../api/set-group-users';
import { useUpdatePermissionGroup } from '../api/update-permission-group';
import {
  PermissionGroupFormSchema,
  type PermissionGroup,
  type PermissionGroupFormValues,
} from '../types/schemas';

import { CapabilityPicker } from './capability-picker';
import { UserMultiSelect } from './user-multi-select';

type PermissionGroupFormDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Groupe à éditer ; undefined = création. */
  group?: PermissionGroup;
};

export function PermissionGroupFormDialog({
  open,
  onOpenChange,
  group,
}: PermissionGroupFormDialogProps) {
  const isEdit = !!group;
  const { addNotification } = useNotifications();

  const registryQuery = useCapabilityRegistry();
  const usersQuery = useUserOptions();

  const [selectedCaps, setSelectedCaps] = useState<Set<string>>(new Set());
  const [selectedUsers, setSelectedUsers] = useState<Set<number>>(new Set());

  const form = useForm<PermissionGroupFormValues>({
    resolver: zodResolver(PermissionGroupFormSchema),
    defaultValues: { name: '', description: '' },
  });

  // Réinitialise le formulaire et les sélections à l'ouverture / changement de
  // groupe (nouvel objet Set à chaque fois — pas de mutation en place).
  useEffect(() => {
    if (!open) return;
    form.reset({
      name: group?.name ?? '',
      description: group?.description ?? '',
    });
    setSelectedCaps(new Set(group?.capabilities ?? []));
    setSelectedUsers(new Set(group?.user_ids ?? []));
  }, [open, group, form]);

  const createMutation = useCreatePermissionGroup({
    onSuccess: () => {
      addNotification({ type: 'success', title: 'Groupe créé' });
      onOpenChange(false);
    },
  });
  const updateMutation = useUpdatePermissionGroup();
  const setCapsMutation = useSetGroupCapabilities();
  const setUsersMutation = useSetGroupUsers();

  const [editSubmitting, setEditSubmitting] = useState(false);

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending ||
    setCapsMutation.isPending ||
    setUsersMutation.isPending ||
    editSubmitting;

  const toggleCap = (code: string) =>
    setSelectedCaps((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });

  const toggleUser = (userId: number) =>
    setSelectedUsers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });

  const onSubmit = async (values: PermissionGroupFormValues) => {
    const capabilityCodes = Array.from(selectedCaps);
    const userIds = Array.from(selectedUsers);

    if (!group) {
      createMutation.mutate({
        name: values.name,
        description: values.description || '',
        capability_codes: capabilityCodes,
        user_ids: userIds,
      });
      return;
    }

    // Édition : PATCH nom/description, puis PUT capacités et membres (REMPLACE).
    // Les erreurs affichent déjà un toast via l'intercepteur api-client.
    setEditSubmitting(true);
    try {
      await updateMutation.mutateAsync({
        groupId: group.id,
        data: { name: values.name, description: values.description || '' },
      });
      await setCapsMutation.mutateAsync({ groupId: group.id, capabilityCodes });
      await setUsersMutation.mutateAsync({ groupId: group.id, userIds });
      addNotification({ type: 'success', title: 'Groupe mis à jour' });
      onOpenChange(false);
    } catch {
      // toast déjà affiché par l'intercepteur ; on garde le dialog ouvert.
    } finally {
      setEditSubmitting(false);
    }
  };

  const registry = useMemo(
    () => registryQuery.data ?? [],
    [registryQuery.data],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Modifier le groupe' : 'Nouveau groupe de permissions'}
          </DialogTitle>
          <DialogDescription>
            Attribuez des capacités et des membres. Les capacités déterminent
            l&apos;accès aux fonctionnalités serveur.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="ex. Analystes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea
                      {...field}
                      rows={2}
                      placeholder="Rôle et périmètre du groupe (optionnel)"
                      className="focus:ring-ring/50 flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus:border-ring focus:ring"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-1.5">
              <p className="text-sm font-medium">Capacités</p>
              <CapabilityPicker
                registry={registry}
                selected={selectedCaps}
                onToggle={toggleCap}
              />
            </div>

            <div className="space-y-1.5">
              <p className="text-sm font-medium">Membres</p>
              <UserMultiSelect
                users={usersQuery.data?.results ?? []}
                selected={selectedUsers}
                onToggle={toggleUser}
                isLoading={usersQuery.isLoading}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending
                  ? 'Enregistrement…'
                  : isEdit
                    ? 'Enregistrer'
                    : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
