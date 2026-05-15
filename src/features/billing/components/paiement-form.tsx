'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/form';

import {
  PAIEMENT_MODE_VALUES,
  PaiementCreateSchema,
  type PaiementCreate,
} from '../types/schemas';

interface PaiementFormProps {
  onSubmit: (data: PaiementCreate) => void;
  isPending?: boolean;
}

const MODE_LABELS: Record<(typeof PAIEMENT_MODE_VALUES)[number], string> = {
  especes: 'Espèces',
  cheque: 'Chèque',
  virement: 'Virement bancaire',
  carte: 'Carte bancaire',
  mobile_money: 'Mobile Money',
  autre: 'Autre',
};

const today = new Date().toISOString().split('T')[0];

export function PaiementForm({ onSubmit, isPending }: PaiementFormProps) {
  const form = useForm<PaiementCreate>({
    resolver: zodResolver(PaiementCreateSchema),
    defaultValues: {
      montant: '',
      mode: 'especes',
      date_paiement: today,
      reference: '',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="montant"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Montant (FCFA) <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input placeholder="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="mode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Mode de paiement <span className="text-destructive">*</span>
                </FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PAIEMENT_MODE_VALUES.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {MODE_LABELS[mode]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="date_paiement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Date de paiement <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reference"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Référence (optionnel)</FormLabel>
                <FormControl>
                  <Input placeholder="N° de reçu, transaction…" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="hover:bg-primary/90 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:pointer-events-none disabled:opacity-50"
          >
            {isPending ? 'Enregistrement…' : 'Enregistrer le paiement'}
          </button>
        </div>
      </form>
    </Form>
  );
}
