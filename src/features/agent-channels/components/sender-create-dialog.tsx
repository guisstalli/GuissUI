'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Switch,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useNotifications } from '@/components/ui/notifications';

import { useCreateSender } from '../api/create-sender';
import { useUserOptions } from '../api/get-users';
import {
  CHANNEL_LABELS,
  CHANNELS,
  createSenderFormSchema,
  type CreateSenderFormValues,
} from '../types';

/**
 * Autoriser une identité (numéro WhatsApp / adresse email) à discuter avec
 * l'assistant — remplace la manipulation du Django admin.
 */
export function SenderCreateDialog() {
  const [open, setOpen] = useState(false);
  const { addNotification } = useNotifications();
  const usersQuery = useUserOptions();

  const form = useForm<CreateSenderFormValues>({
    resolver: zodResolver(createSenderFormSchema),
    defaultValues: {
      channel: 'whatsapp',
      identifier: '',
      user_id: 0,
      can_chat: true,
      can_trigger_actions: false,
    },
  });

  const createMutation = useCreateSender({
    onSuccess: () => {
      addNotification({ type: 'success', title: 'Identité autorisée' });
      setOpen(false);
      form.reset();
    },
  });

  const channel = form.watch('channel');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-1.5 size-4" aria-hidden />
          Autoriser une identité
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Autoriser une identité</DialogTitle>
          <DialogDescription>
            Cette identité pourra discuter avec l&apos;assistant sur le canal
            choisi. Les réponses restent limitées aux données agrégées.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit((values) =>
              createMutation.mutate(values),
            )}
          >
            <FormField
              control={form.control}
              name="channel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Canal</FormLabel>
                  <FormControl>
                    <select
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={field.value}
                      onChange={field.onChange}
                    >
                      {CHANNELS.map((value) => (
                        <option key={value} value={value}>
                          {CHANNEL_LABELS[value]}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {channel === 'whatsapp'
                      ? 'Numéro WhatsApp'
                      : 'Adresse email'}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        channel === 'whatsapp'
                          ? '+221771234567'
                          : 'docteur@guiss.sn'
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="user_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Compte plateforme lié</FormLabel>
                  <FormControl>
                    <select
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                      value={field.value}
                      onChange={(event) =>
                        field.onChange(Number(event.target.value))
                      }
                    >
                      <option value={0}>Sélectionner un utilisateur…</option>
                      {(usersQuery.data?.results ?? []).map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.email} ({user.role})
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="can_trigger_actions"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                  <div>
                    <FormLabel>Actions sensibles</FormLabel>
                    <p className="text-xs text-muted-foreground">
                      Autoriser la génération de rapports depuis ce canal.
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Autorisation…' : 'Autoriser'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
