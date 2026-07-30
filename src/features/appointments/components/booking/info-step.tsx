import { Phone, User } from 'lucide-react';
import type { UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

import { MOTIF_AUTRE_VALUE, MOTIF_GROUPS } from '../../types/motifs';
import type { ReservationFormInput } from '../../types/schemas';
import { formatDateFr, formatSlot } from '../../utils/format';

export function InfoStep({
  form,
  selectedDate,
  selectedSlot,
}: {
  form: UseFormReturn<ReservationFormInput>;
  selectedDate: string;
  selectedSlot: string;
}) {
  const motif = form.watch('motif');

  return (
    <div>
      <h2 className="mb-2 flex items-center gap-2 text-xl font-bold text-foreground">
        <User className="size-5 text-cyan-500 dark:text-cyan-400" />
        Vos informations
      </h2>
      <p className="mb-6 text-sm text-muted-foreground">
        Renseignez vos coordonnées pour confirmer votre rendez-vous.
      </p>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="patient_prenom"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">
                  Prénom *
                </FormLabel>
                <FormControl>
                  <Input placeholder="Fatou" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="patient_nom"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">
                  Nom *
                </FormLabel>
                <FormControl>
                  <Input placeholder="Diallo" {...field} />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="patient_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-muted-foreground">
                Téléphone *
              </FormLabel>
              <FormControl>
                <Input placeholder="+221 77 000 00 00" {...field} />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="patient_email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-muted-foreground">
                Email (optionnel)
              </FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="fatou@example.com"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="motif"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs font-medium text-muted-foreground">
                Motif (optionnel)
              </FormLabel>
              <Select
                value={field.value ?? ''}
                onValueChange={(value) => {
                  field.onChange(value);
                  if (value !== MOTIF_AUTRE_VALUE) {
                    form.setValue('motif_autre', '');
                    form.clearErrors('motif_autre');
                  }
                }}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un motif" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MOTIF_GROUPS.map((group, i) => (
                    <SelectGroup key={group.label ?? `group-${i}`}>
                      {group.label && <SelectLabel>{group.label}</SelectLabel>}
                      {group.options.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage className="text-xs" />
            </FormItem>
          )}
        />

        {motif === MOTIF_AUTRE_VALUE && (
          <FormField
            control={form.control}
            name="motif_autre"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-medium text-muted-foreground">
                  Précisez le motif *
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Décrivez la raison de votre consultation"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />
        )}

        {/* want_reminder toggle — FormField pour associer label ↔ switch (a11y) */}
        <FormField
          control={form.control}
          name="want_reminder"
          render={({ field }) => (
            <FormItem className="bg-muted/30 flex flex-row items-center justify-between space-y-0 rounded-xl border border-border p-4">
              <div className="flex items-start gap-3">
                <Phone className="mt-0.5 size-4 shrink-0 text-cyan-500/70 dark:text-cyan-400/70" />
                <div>
                  <FormLabel className="text-sm font-medium text-foreground">
                    Rappel Whatsapp
                  </FormLabel>
                  <p className="text-xs text-muted-foreground">
                    Recevez un rappel avant votre rendez-vous
                  </p>
                </div>
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

        {/* summary */}
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-50/60 p-4 dark:border-cyan-400/15 dark:bg-cyan-400/[0.04]">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Récapitulatif
          </p>
          <div className="grid grid-cols-2 gap-y-1.5 text-sm">
            <span className="text-muted-foreground">Date</span>
            <span className="font-medium capitalize text-foreground">
              {formatDateFr(selectedDate)}
            </span>
            <span className="text-muted-foreground">Heure</span>
            <span className="font-medium text-cyan-600 dark:text-cyan-400">
              {formatSlot(selectedSlot)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
