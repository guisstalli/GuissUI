'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  CalendarOff,
  Loader2,
  Plus,
  Save,
  Settings,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AppShell as Shell } from '@/app/_shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
} from '@/components/ui/form';
import { useNotifications } from '@/components/ui/notifications';
import { Skeleton } from '@/components/ui/skeleton';
import { useRdvConfig } from '@/features/appointments/api/get-config';
import { useJoursFermes } from '@/features/appointments/api/get-jours-fermes';
import {
  useCreateJourFerme,
  useDeleteJourFerme,
} from '@/features/appointments/api/manage-jours-fermes';
import { useUpdateRdvConfig } from '@/features/appointments/api/update-config';
import type { RdvConfig } from '@/features/appointments/types/schemas';
import { cn } from '@/lib/utils';

const JOURS = [
  { key: 'lundi', label: 'Lun' },
  { key: 'mardi', label: 'Mar' },
  { key: 'mercredi', label: 'Mer' },
  { key: 'jeudi', label: 'Jeu' },
  { key: 'vendredi', label: 'Ven' },
  { key: 'samedi', label: 'Sam' },
  { key: 'dimanche', label: 'Dim' },
] as const;

type JourKey = (typeof JOURS)[number]['key'];

const ConfigSchema = z.object({
  slot_duration: z.coerce.number().min(5).max(120),
  heure_debut: z.string().min(1),
  heure_fin: z.string().min(1),
  capacite_par_slot: z.coerce.number().min(1),
  buffer_avance_heures: z.coerce.number().min(0),
  reschedule_limit: z.coerce.number().min(0),
  lundi: z.boolean(),
  mardi: z.boolean(),
  mercredi: z.boolean(),
  jeudi: z.boolean(),
  vendredi: z.boolean(),
  samedi: z.boolean(),
  dimanche: z.boolean(),
});

function ConfigForm({ config }: { config: RdvConfig }) {
  const { addNotification } = useNotifications();
  const { mutate: update, isPending } = useUpdateRdvConfig({
    onSuccess: () =>
      addNotification({
        type: 'success',
        title: 'Configuration enregistrée',
        message: 'Les paramètres ont été mis à jour.',
      }),
    onError: () =>
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de sauvegarder la configuration.',
      }),
  });

  const form = useForm<RdvConfig>({
    resolver: zodResolver(ConfigSchema),
    defaultValues: { reschedule_limit: 0, ...config },
  });

  const jours = form.watch(JOURS.map((j) => j.key) as JourKey[]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => update(data))}
        className="space-y-6"
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField
            control={form.control}
            name="slot_duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Durée d&apos;un créneau (min)</FormLabel>
                <FormControl>
                  <Input type="number" min={5} max={120} {...field} />
                </FormControl>
                <p className="mt-1 text-xs text-muted-foreground">
                  Durée de chaque créneau horaire
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="capacite_par_slot"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacité par créneau</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <p className="mt-1 text-xs text-muted-foreground">
                  Nombre de patients acceptés par créneau
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="buffer_avance_heures"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Délai minimum (heures)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <p className="mt-1 text-xs text-muted-foreground">
                  Délai minimum avant de pouvoir réserver
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="heure_debut"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heure d&apos;ouverture</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <p className="mt-1 text-xs text-muted-foreground">
                  Heure d&apos;ouverture du cabinet
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="heure_fin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Heure de fermeture</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <p className="mt-1 text-xs text-muted-foreground">
                  Heure de fermeture du cabinet
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reschedule_limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Limite de replanifications</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} />
                </FormControl>
                <p className="mt-1 text-xs text-muted-foreground">
                  Max. de replanifications par RDV (0 = illimité)
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Jours ouvrés */}
        <div>
          <p className="mb-2 text-sm font-medium">Jours ouvrés</p>
          <div className="flex flex-wrap gap-2">
            {JOURS.map((j, idx) => {
              const checked = jours[idx];
              return (
                <button
                  key={j.key}
                  type="button"
                  onClick={() => form.setValue(j.key, !checked)}
                  className={cn(
                    'rounded-full border px-3 py-1 text-sm font-medium transition-colors',
                    checked
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/50',
                  )}
                >
                  {j.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isPending} className="gap-2">
            {isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Enregistrer
          </Button>
        </div>
      </form>
    </Form>
  );
}

function JoursFermesSection() {
  const { data: jours, isLoading } = useJoursFermes();
  const [newDate, setNewDate] = useState('');
  const [newMotif, setNewMotif] = useState('');

  const { mutate: create, isPending: creating } = useCreateJourFerme({
    onSuccess: () => {
      setNewDate('');
      setNewMotif('');
    },
  });
  const { mutate: del } = useDeleteJourFerme();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Date</p>
          <Input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-xs font-medium text-muted-foreground">
            Motif (optionnel)
          </p>
          <Input
            placeholder="Férié national…"
            value={newMotif}
            onChange={(e) => setNewMotif(e.target.value)}
          />
        </div>
        <Button
          size="sm"
          disabled={!newDate || creating}
          onClick={() =>
            create({ date: newDate, motif: newMotif || undefined })
          }
          className="gap-1.5"
        >
          {creating ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Plus className="size-4" />
          )}
          Ajouter
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 rounded-lg" />
          ))}
        </div>
      ) : !jours?.length ? (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Aucun jour fermé configuré.
        </p>
      ) : (
        <ul className="space-y-2">
          {jours.map((jour) => (
            <li
              key={jour.id}
              className="flex items-center justify-between rounded-lg border bg-card px-4 py-2.5"
            >
              <div>
                <span className="text-sm font-medium">
                  {new Date(jour.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                {jour.motif && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    — {jour.motif}
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 text-destructive hover:bg-destructive/10"
                onClick={() => del(jour.id)}
              >
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function RdvConfigPage() {
  const { data: config, isLoading } = useRdvConfig();

  return (
    <Shell title="Configuration Agenda">
      <div className="space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Settings className="size-6" />
            Configuration des rendez-vous
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Horaires d&apos;ouverture, créneaux et jours fermés.
          </p>
        </div>

        {/* Config form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Paramètres généraux</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-lg" />
                ))}
              </div>
            ) : config ? (
              <ConfigForm config={config} />
            ) : (
              <p className="text-sm text-muted-foreground">
                Impossible de charger la configuration.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Jours fermés */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarOff className="size-4" />
              Jours fermés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <JoursFermesSection />
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
