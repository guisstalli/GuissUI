'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Send } from 'lucide-react';
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
  Checkbox,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Textarea,
} from '@/components/ui/form';

import { useDeliverReport } from '../api/deliver-report';
import {
  DELIVER_CHANNEL_LABELS,
  DELIVER_CHANNELS,
  deliverReportFormSchema,
  splitRecipients,
  type DeliverChannel,
  type DeliverReportFormValues,
} from '../types';

interface ReportDeliverDialogProps {
  reportId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportDeliverDialog({
  reportId,
  open,
  onOpenChange,
}: ReportDeliverDialogProps) {
  const form = useForm<DeliverReportFormValues>({
    resolver: zodResolver(deliverReportFormSchema),
    defaultValues: { channels: ['email'], emails: '', phones: '' },
  });

  const channels = form.watch('channels');

  const deliverMutation = useDeliverReport({
    mutationConfig: {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    },
  });

  const onSubmit = (values: DeliverReportFormValues) => {
    deliverMutation.mutate({
      reportId,
      channels: values.channels,
      recipients: {
        ...(values.channels.includes('email')
          ? { email: splitRecipients(values.emails) }
          : {}),
        ...(values.channels.includes('whatsapp')
          ? { whatsapp: splitRecipients(values.phones) }
          : {}),
      },
    });
  };

  const toggleChannel = (
    current: DeliverChannel[],
    channel: DeliverChannel,
    checked: boolean,
  ): DeliverChannel[] =>
    checked
      ? [...current, channel]
      : current.filter((item) => item !== channel);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      form.reset();
      deliverMutation.reset();
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Diffuser le rapport</DialogTitle>
          <DialogDescription>
            Seul un rapport approuvé peut être diffusé. L&apos;envoi part en
            arrière-plan dès la confirmation.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="channels"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Canaux</FormLabel>
                  <div className="space-y-2">
                    {DELIVER_CHANNELS.map((channel) => (
                      <label
                        key={channel}
                        htmlFor={`deliver-channel-${channel}`}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <Checkbox
                          id={`deliver-channel-${channel}`}
                          checked={field.value.includes(channel)}
                          onCheckedChange={(checked) =>
                            field.onChange(
                              toggleChannel(
                                field.value,
                                channel,
                                checked === true,
                              ),
                            )
                          }
                        />
                        {DELIVER_CHANNEL_LABELS[channel]}
                      </label>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {channels.includes('email') && (
              <FormField
                control={form.control}
                name="emails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destinataires email</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        placeholder="direction@exemple.sn, medecin@exemple.sn"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {channels.includes('whatsapp') && (
              <FormField
                control={form.control}
                name="phones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Numéros WhatsApp</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        placeholder="+221771234567, +221781234567"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {deliverMutation.isError && (
              <p className="text-sm text-destructive" role="alert">
                {deliverMutation.error instanceof Error
                  ? deliverMutation.error.message
                  : 'La diffusion a échoué. Réessayez.'}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={deliverMutation.isPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={deliverMutation.isPending}>
                {deliverMutation.isPending ? (
                  <Loader2 className="mr-1.5 size-4 animate-spin" aria-hidden />
                ) : (
                  <Send className="mr-1.5 size-4" aria-hidden />
                )}
                Diffuser
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
