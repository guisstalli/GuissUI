'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Ban, Loader2 } from 'lucide-react';
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
  Textarea,
} from '@/components/ui/form';

import { useRejectReport } from '../api/reject-report';
import { rejectReportFormSchema, type RejectReportFormValues } from '../types';

interface ReportRejectDialogProps {
  reportId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportRejectDialog({
  reportId,
  open,
  onOpenChange,
}: ReportRejectDialogProps) {
  const form = useForm<RejectReportFormValues>({
    resolver: zodResolver(rejectReportFormSchema),
    defaultValues: { reason: '' },
  });

  const rejectMutation = useRejectReport({
    mutationConfig: {
      onSuccess: () => {
        form.reset();
        onOpenChange(false);
      },
    },
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      form.reset();
      rejectMutation.reset();
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Rejeter le rapport</DialogTitle>
          <DialogDescription>
            Le motif est conservé dans le journal d&apos;audit et affiché au
            demandeur.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) =>
              rejectMutation.mutate({ reportId, reason: values.reason }),
            )}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motif du rejet</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Ex. : chiffres du site de Thiès incohérents avec le tableau de bord…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {rejectMutation.isError && (
              <p className="text-sm text-destructive" role="alert">
                {rejectMutation.error instanceof Error
                  ? rejectMutation.error.message
                  : 'Le rejet a échoué. Réessayez.'}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={rejectMutation.isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={rejectMutation.isPending}
              >
                {rejectMutation.isPending ? (
                  <Loader2 className="mr-1.5 size-4 animate-spin" aria-hidden />
                ) : (
                  <Ban className="mr-1.5 size-4" aria-hidden />
                )}
                Rejeter
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
