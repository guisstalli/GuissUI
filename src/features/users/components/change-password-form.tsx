'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
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
import { useLogout } from '@/lib/auth';

import { useChangePassword } from '../api/change-password';
import {
  ChangePasswordSchema,
  type ChangePasswordInput,
} from '../types/schemas';

export function ChangePasswordForm() {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { addNotification } = useNotifications();
  const { logoutWithRedirect } = useLogout();

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirmPassword: '',
    },
  });

  const { mutate, isPending } = useChangePassword({
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Mot de passe modifié',
        message: 'Vous allez être redirigé vers la page de connexion.',
      });
      setTimeout(() => logoutWithRedirect(), 1500);
    },
  });

  const onSubmit = (values: ChangePasswordInput) => {
    mutate({
      current_password: values.current_password,
      new_password: values.new_password,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Current password */}
        <FormField
          control={form.control}
          name="current_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mot de passe actuel</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showCurrent ? 'text' : 'password'}
                    placeholder="Mot de passe actuel"
                    className="pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                    aria-label={showCurrent ? 'Masquer' : 'Afficher'}
                  >
                    {showCurrent ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* New password */}
        <FormField
          control={form.control}
          name="new_password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nouveau mot de passe</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showNew ? 'text' : 'password'}
                    placeholder="Minimum 8 caractères"
                    className="pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                    aria-label={showNew ? 'Masquer' : 'Afficher'}
                  >
                    {showNew ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Confirm password */}
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirmer le mot de passe</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Répéter le nouveau mot de passe"
                    className="pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute inset-y-0 right-3 flex items-center text-muted-foreground hover:text-foreground"
                    aria-label={showConfirm ? 'Masquer' : 'Afficher'}
                  >
                    {showConfirm ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? 'Modification...' : 'Modifier le mot de passe'}
        </Button>
      </form>
    </Form>
  );
}
