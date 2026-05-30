'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import {
  Bell,
  Building2,
  CreditCard,
  Loader2,
  Pill,
  Save,
  Sliders,
} from 'lucide-react';
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
  Switch,
  Textarea,
} from '@/components/ui/form';
import { useNotifications } from '@/components/ui/notifications';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useReminderConfig } from '@/features/appointments/api/get-reminder-config';
import { useUpdateReminderConfig } from '@/features/appointments/api/update-reminder-config';
import type { ReminderConfig } from '@/features/appointments/types/schemas';
import { useBillingPreferences } from '@/features/billing/api/get-billing-preferences';
import { useUpdateBillingPreferences } from '@/features/billing/api/update-billing-preferences';
import type { BillingPreferences } from '@/features/billing/types/schemas';
import { useClinicSettings } from '@/features/clinic/api/get-clinic-settings';
import { ClinicSettingsForm } from '@/features/clinic/components/clinic-settings-form';
import { MedicamentsAdminTable } from '@/features/medicaments-admin/components/medicaments-admin-table';
import { useUser } from '@/lib/auth';

// ─── Reminder form ────────────────────────────────────────────────────────────

const ReminderSchema = z.object({
  rappel_j1_actif: z.boolean(),
  rappel_j1_heure: z.string().min(1),
  rappel_h2_actif: z.boolean(),
  canal: z.enum(['in_app', 'email', 'both']),
  message_template: z.string().min(1),
});

function ReminderConfigForm({ config }: { config: ReminderConfig }) {
  const { addNotification } = useNotifications();
  const { mutate: update, isPending } = useUpdateReminderConfig({
    onSuccess: () =>
      addNotification({
        type: 'success',
        title: 'Configuration enregistrée',
        message: 'Les paramètres de rappel ont été mis à jour.',
      }),
    onError: () =>
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de sauvegarder.',
      }),
  });

  const form = useForm<ReminderConfig>({
    resolver: zodResolver(ReminderSchema),
    defaultValues: config,
  });

  const j1Actif = form.watch('rappel_j1_actif');

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => update(data))}
        className="space-y-6"
      >
        {/* J-1 */}
        <div className="space-y-4 rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Rappel la veille (J-1)</p>
              <p className="text-xs text-muted-foreground">
                Envoyé la veille du rendez-vous
              </p>
            </div>
            <FormField
              control={form.control}
              name="rappel_j1_actif"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          {j1Actif && (
            <FormField
              control={form.control}
              name="rappel_j1_heure"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure d&apos;envoi</FormLabel>
                  <FormControl>
                    <Input type="time" className="w-32" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        {/* H-2 */}
        <div className="flex items-center justify-between rounded-lg border bg-card p-4">
          <div>
            <p className="text-sm font-medium">Rappel 2h avant (H-2)</p>
            <p className="text-xs text-muted-foreground">
              Envoyé 2 heures avant le rendez-vous
            </p>
          </div>
          <FormField
            control={form.control}
            name="rappel_h2_actif"
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
        </div>

        {/* Canal */}
        <FormField
          control={form.control}
          name="canal"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Canal d&apos;envoi</FormLabel>
              <div className="flex gap-2">
                {(
                  [
                    { value: 'email', label: 'Email' },
                    { value: 'in_app', label: 'In-app' },
                    { value: 'both', label: 'Les deux' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => field.onChange(opt.value)}
                    className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                      field.value === opt.value
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'hover:border-primary/50 border-border bg-card text-muted-foreground'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Template */}
        <FormField
          control={form.control}
          name="message_template"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Modèle de message</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} />
              </FormControl>
              <p className="mt-1 text-xs text-muted-foreground">
                Variables disponibles : {'{date}'}, {'{heure}'},{' '}
                {'{patient_nom}'}, {'{lien_annulation}'}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

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

// ─── Billing preferences form ─────────────────────────────────────────────────

const BillingSchema = z.object({
  prefixe_facture: z.string().min(1).max(10),
  conditions_paiement: z.string().max(200),
  mention_legale: z.string(),
});

type BillingFormInput = z.infer<typeof BillingSchema>;

function BillingPreferencesForm({ prefs }: { prefs: BillingPreferences }) {
  const { addNotification } = useNotifications();
  const { mutate: update, isPending } = useUpdateBillingPreferences({
    onSuccess: () =>
      addNotification({
        type: 'success',
        title: 'Préférences enregistrées',
        message: 'Les préférences de facturation ont été mises à jour.',
      }),
    onError: () =>
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de sauvegarder.',
      }),
  });

  const form = useForm<BillingFormInput>({
    resolver: zodResolver(BillingSchema),
    defaultValues: {
      prefixe_facture: prefs.prefixe_facture,
      conditions_paiement: prefs.conditions_paiement,
      mention_legale: prefs.mention_legale,
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => update(data))}
        className="space-y-6"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="prefixe_facture"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Préfixe des factures</FormLabel>
                <FormControl>
                  <Input placeholder="FAC" {...field} />
                </FormControl>
                <p className="mt-1 text-xs text-muted-foreground">
                  Ex: FAC → FAC-2025-0001
                </p>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="space-y-1.5">
            <p className="text-sm font-medium">Prochain numéro</p>
            <div className="flex h-9 items-center rounded-md border bg-muted px-3 text-sm text-muted-foreground">
              {prefs.prochain_numero}
            </div>
            <p className="text-xs text-muted-foreground">
              Incrémenté automatiquement
            </p>
          </div>
        </div>

        <FormField
          control={form.control}
          name="conditions_paiement"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conditions de paiement</FormLabel>
              <FormControl>
                <Input placeholder="Paiement à la prestation" {...field} />
              </FormControl>
              <p className="mt-1 text-xs text-muted-foreground">
                Mention imprimée sur les factures
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="mention_legale"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mention légale</FormLabel>
              <FormControl>
                <Textarea
                  rows={3}
                  placeholder="Pied de page légal…"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ParametresPage() {
  const { user } = useUser();
  const canManageClinic = user?.role === 'ADMIN' || user?.role === 'SUPERUSER';
  const { data: reminderConfig, isLoading: loadingReminder } =
    useReminderConfig();
  const { data: billingPrefs, isLoading: loadingBilling } =
    useBillingPreferences();
  const { data: clinicSettings, isLoading: loadingClinic } =
    useClinicSettings();

  return (
    <Shell title="Paramètres">
      <div className="space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
            <Sliders className="size-6" />
            Paramètres
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Configuration des rappels et de la facturation.
          </p>
        </div>

        <Tabs defaultValue="rappels">
          <TabsList>
            <TabsTrigger value="rappels" className="gap-2">
              <Bell className="size-4" />
              Rappels RDV
            </TabsTrigger>
            <TabsTrigger value="facturation" className="gap-2">
              <CreditCard className="size-4" />
              Facturation
            </TabsTrigger>
            {canManageClinic && (
              <TabsTrigger value="clinique" className="gap-2">
                <Building2 className="size-4" />
                Clinique
              </TabsTrigger>
            )}
            {canManageClinic && (
              <TabsTrigger value="medicaments" className="gap-2">
                <Pill className="size-4" />
                Médicaments
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="rappels" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Rappels automatiques
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingReminder ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-12 rounded-lg" />
                    ))}
                  </div>
                ) : reminderConfig ? (
                  <ReminderConfigForm config={reminderConfig} />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Impossible de charger la configuration.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="facturation" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Préférences de facturation
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingBilling ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-10 rounded-lg" />
                    ))}
                  </div>
                ) : billingPrefs ? (
                  <BillingPreferencesForm prefs={billingPrefs} />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Impossible de charger les préférences.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {canManageClinic && (
            <TabsContent value="clinique" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Informations de la clinique
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingClinic ? (
                    <div className="space-y-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Skeleton key={i} className="h-10 rounded-lg" />
                      ))}
                    </div>
                  ) : clinicSettings ? (
                    <ClinicSettingsForm settings={clinicSettings} />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Impossible de charger les paramètres.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {canManageClinic && (
            <TabsContent value="medicaments" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Référentiel médicaments
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Niveau 3 du référentiel (table locale). Les médecins voient
                    ces entrées en autocomplétion lors de la prescription, et
                    les résultats RxNorm matchant un DCI local sont enrichis
                    automatiquement.
                  </p>
                </CardHeader>
                <CardContent>
                  <MedicamentsAdminTable />
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Shell>
  );
}
