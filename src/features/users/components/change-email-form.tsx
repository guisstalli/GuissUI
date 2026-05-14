'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Mail } from 'lucide-react';
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

import { useChangeEmailConfirm } from '../api/change-email-confirm';
import { useChangeEmailRequest } from '../api/change-email-request';
import {
  ChangeEmailConfirmSchema,
  ChangeEmailRequestSchema,
  type ChangeEmailConfirmInput,
  type ChangeEmailRequestInput,
} from '../types/schemas';

interface ChangeEmailFormProps {
  currentEmail: string;
}

export function ChangeEmailForm({ currentEmail }: ChangeEmailFormProps) {
  const [step, setStep] = useState<'request' | 'confirm'>('request');
  const [pendingEmail, setPendingEmail] = useState('');
  const { addNotification } = useNotifications();

  const requestForm = useForm<ChangeEmailRequestInput>({
    resolver: zodResolver(ChangeEmailRequestSchema),
    defaultValues: { new_email: '' },
  });

  const confirmForm = useForm<ChangeEmailConfirmInput>({
    resolver: zodResolver(ChangeEmailConfirmSchema),
    defaultValues: { otp: '' },
  });

  const { mutate: requestChange, isPending: isRequesting } =
    useChangeEmailRequest({
      onSuccess: () => {
        setPendingEmail(requestForm.getValues('new_email'));
        setStep('confirm');
        addNotification({
          type: 'success',
          title: 'Code OTP envoyé à votre nouvel email',
        });
      },
    });

  const { mutate: confirmChange, isPending: isConfirming } =
    useChangeEmailConfirm({
      onSuccess: () => {
        addNotification({
          type: 'success',
          title: 'Email modifié avec succès',
        });
        setStep('request');
        requestForm.reset();
        confirmForm.reset();
      },
    });

  if (step === 'confirm') {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 rounded-lg bg-muted px-4 py-3 text-sm">
          <Mail className="size-4 shrink-0 text-muted-foreground" />
          <span className="text-muted-foreground">
            Un code a été envoyé à{' '}
            <strong className="text-foreground">{pendingEmail}</strong>
          </span>
        </div>

        <Form {...confirmForm}>
          <form
            onSubmit={confirmForm.handleSubmit((v) => confirmChange(v))}
            className="space-y-4"
          >
            <FormField
              control={confirmForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code de vérification</FormLabel>
                  <FormControl>
                    <Input placeholder="123 456" maxLength={7} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setStep('request')}
              >
                <ArrowLeft className="mr-1.5 size-4" />
                Retour
              </Button>
              <Button type="submit" disabled={isConfirming}>
                {isConfirming ? 'Vérification...' : 'Confirmer le changement'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }

  return (
    <Form {...requestForm}>
      <form
        onSubmit={requestForm.handleSubmit((v) => requestChange(v))}
        className="space-y-4"
      >
        {/* Current email (readonly) */}
        <div className="space-y-1.5">
          <label
            htmlFor="current-email"
            className="text-sm font-medium text-foreground"
          >
            Email actuel
          </label>
          <Input id="current-email" value={currentEmail} readOnly disabled />
        </div>

        {/* New email */}
        <FormField
          control={requestForm.control}
          name="new_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nouvel email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="nouveau@exemple.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isRequesting}>
          {isRequesting ? 'Envoi...' : 'Envoyer le code de vérification'}
        </Button>
      </form>
    </Form>
  );
}
