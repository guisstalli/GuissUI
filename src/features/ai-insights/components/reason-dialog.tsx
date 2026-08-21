'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
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

import { reasonFormSchema, type ReasonFormValues } from '../types';

interface ReasonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  submitLabel: string;
  submitVariant?: 'default' | 'destructive' | 'outline';
  isPending: boolean;
  isError: boolean;
  errorMessage?: string;
  onSubmit: (reason: string) => void;
}

/**
 * Dialogue générique pour les actions nécessitant un motif obligatoire.
 * Utilisé par rejet et quarantaine.
 * Le formulaire bloque la soumission si le motif est vide — jamais question
 * de compter sur le 400 serveur pour l'imposer.
 */
export function ReasonDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  submitVariant = 'destructive',
  isPending,
  isError,
  errorMessage,
  onSubmit,
}: ReasonDialogProps) {
  const form = useForm<ReasonFormValues>({
    resolver: zodResolver(reasonFormSchema),
    defaultValues: { reason: '' },
  });

  const handleOpenChange = (next: boolean) => {
    if (!next) form.reset();
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => onSubmit(values.reason))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motif</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Expliquer brièvement la décision…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isError && (
              <p className="text-sm text-destructive" role="alert">
                {errorMessage ?? `L'action a échoué. Réessayez.`}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                variant={submitVariant}
                disabled={isPending}
              >
                {isPending && (
                  <Loader2 className="mr-1.5 size-4 animate-spin" aria-hidden />
                )}
                {submitLabel}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
