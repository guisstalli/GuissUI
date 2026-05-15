'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Edit2, Loader2, Package, Plus, Save, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { AppShell as Shell } from '@/app/_shell';
import { Badge } from '@/components/ui/badge';
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
import { useCreatePrestation } from '@/features/billing/api/create-prestation';
import { useDeletePrestation } from '@/features/billing/api/delete-prestation';
import { usePrestations } from '@/features/billing/api/get-prestations';
import { useUpdatePrestation } from '@/features/billing/api/update-prestation';
import type { Prestation } from '@/features/billing/types/schemas';

// ─── Schema ───────────────────────────────────────────────────────────────────

const PrestationSchema = z.object({
  libelle: z.string().min(1, 'Libellé requis'),
  prix: z.string().min(1, 'Prix requis'),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

type PrestationFormInput = z.infer<typeof PrestationSchema>;

// ─── Form component ───────────────────────────────────────────────────────────

function PrestationForm({
  defaultValues,
  onSave,
  onCancel,
  isPending,
}: {
  defaultValues?: Partial<PrestationFormInput>;
  onSave: (data: PrestationFormInput) => void;
  onCancel: () => void;
  isPending: boolean;
}) {
  const form = useForm<PrestationFormInput>({
    resolver: zodResolver(PrestationSchema),
    defaultValues: {
      libelle: '',
      prix: '',
      description: '',
      is_active: true,
      ...defaultValues,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSave)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="libelle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Libellé</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Consultation ophtalmologique"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="prix"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prix (XOF)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="5000" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  rows={2}
                  placeholder="Description optionnelle…"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3">
              <Switch checked={field.value} onCheckedChange={field.onChange} />
              <FormLabel className="!mt-0 cursor-pointer">Active</FormLabel>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
            <X className="size-4" />
            Annuler
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isPending}
            className="gap-2"
          >
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

// ─── Row component ────────────────────────────────────────────────────────────

function PrestationRow({ prestation }: { prestation: Prestation }) {
  const [editing, setEditing] = useState(false);
  const { addNotification } = useNotifications();

  const { mutate: update, isPending: updating } = useUpdatePrestation({
    onSuccess: () => {
      addNotification({ type: 'success', title: 'Prestation mise à jour' });
      setEditing(false);
    },
    onError: () =>
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de modifier.',
      }),
  });

  const { mutate: remove, isPending: removing } = useDeletePrestation({
    onSuccess: () =>
      addNotification({ type: 'success', title: 'Prestation supprimée' }),
    onError: () =>
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de supprimer.',
      }),
  });

  if (editing) {
    return (
      <li className="rounded-lg border bg-card p-4">
        <PrestationForm
          defaultValues={{
            libelle: prestation.libelle,
            prix: prestation.prix,
            description: prestation.description,
            is_active: prestation.is_active,
          }}
          onSave={(data) => update({ id: prestation.id, ...data })}
          onCancel={() => setEditing(false)}
          isPending={updating}
        />
      </li>
    );
  }

  return (
    <li className="flex items-center justify-between rounded-lg border bg-card px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium">
            {prestation.libelle}
          </span>
          {!prestation.is_active && (
            <Badge variant="secondary" className="text-xs">
              Inactive
            </Badge>
          )}
        </div>
        {prestation.description && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {prestation.description}
          </p>
        )}
      </div>
      <div className="ml-4 flex shrink-0 items-center gap-3">
        <span className="text-sm font-semibold tabular-nums">
          {prestation.prix_display}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setEditing(true)}
        >
          <Edit2 className="size-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-destructive/10 size-8 text-destructive"
          disabled={removing}
          onClick={() => remove(prestation.id)}
        >
          {removing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </Button>
      </div>
    </li>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PrestationsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const { data: prestations, isLoading } = usePrestations();
  const { addNotification } = useNotifications();

  const { mutate: create, isPending: creating } = useCreatePrestation({
    onSuccess: () => {
      addNotification({ type: 'success', title: 'Prestation créée' });
      setShowCreate(false);
    },
    onError: () =>
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de créer.',
      }),
  });

  return (
    <Shell title="Prestations">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
              <Package className="size-6" />
              Prestations
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Catalogue des services et tarifs de référence.
            </p>
          </div>
          {!showCreate && (
            <Button
              size="sm"
              onClick={() => setShowCreate(true)}
              className="gap-2"
            >
              <Plus className="size-4" />
              Ajouter
            </Button>
          )}
        </div>

        {showCreate && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Nouvelle prestation</CardTitle>
            </CardHeader>
            <CardContent>
              <PrestationForm
                onSave={(data) => create(data)}
                onCancel={() => setShowCreate(false)}
                isPending={creating}
              />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {prestations
                ? `${prestations.length} prestation${prestations.length !== 1 ? 's' : ''}`
                : 'Catalogue'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-14 rounded-lg" />
                ))}
              </div>
            ) : !prestations?.length ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aucune prestation configurée.
              </p>
            ) : (
              <ul className="space-y-2">
                {prestations.map((p) => (
                  <PrestationRow key={p.id} prestation={p} />
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </Shell>
  );
}
