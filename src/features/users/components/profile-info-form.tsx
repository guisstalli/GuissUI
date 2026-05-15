'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Upload } from 'lucide-react';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
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

import { useUpdateMe } from '../api/update-me';
import {
  UpdateMeSchema,
  type UpdateMeInput,
  type User,
} from '../types/schemas';

interface ProfileInfoFormProps {
  user: User;
}

export function ProfileInfoForm({ user }: ProfileInfoFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useNotifications();

  const form = useForm<UpdateMeInput>({
    resolver: zodResolver(UpdateMeSchema),
    defaultValues: {
      first_name: user.profile?.first_name ?? '',
      last_name: user.profile?.last_name ?? '',
      title: user.profile?.title ?? '',
    },
  });

  const { mutate, isPending } = useUpdateMe({
    onSuccess: () =>
      addNotification({ type: 'success', title: 'Profil mis à jour' }),
  });

  const onSubmit = (values: UpdateMeInput) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        formData.append(key, value);
      }
    });
    mutate(formData);
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('avatar', file);
    mutate(formData);
  };

  return (
    <div className="space-y-6">
      {/* Avatar upload */}
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleAvatarChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-2 size-4" aria-hidden="true" />
          Changer l&apos;avatar
        </Button>
        <span className="text-xs text-muted-foreground">
          JPG, PNG ou GIF — max 2 Mo
        </span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Civilité</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="shadow-xs focus:ring-ring/50 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus:border-ring focus:ring"
                  >
                    <option value="">Non spécifié</option>
                    <option value="MR">M.</option>
                    <option value="MME">Mme</option>
                    <option value="MLLE">Mlle</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            {/* First name */}
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl>
                    <Input placeholder="Prénom" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Last name */}
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom de famille" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" disabled={isPending}>
            {isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
