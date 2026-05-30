'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Save, Search } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
} from '@/components/ui/form';
import { useNotifications } from '@/components/ui/notifications';
import { MedicamentSelector } from '@/features/exams/components/medicament-selector';

import {
  useCreateMedicament,
  useImportMedicamentFromRxnorm,
  useUpdateMedicament,
} from '../api/medicament-mutations';
import {
  FORME_LABELS,
  type FormeGalenique,
  type MedicamentAdmin,
  type MedicamentInput,
  MedicamentInputSchema,
} from '../types/schemas';

interface MedicamentEditDialogProps {
  open: boolean;
  onClose: () => void;
  medicament?: MedicamentAdmin | null;
}

const FORMES: FormeGalenique[] = [
  'COLLYRE',
  'POMMADE',
  'COMPRIMES',
  'INJECTION',
  'GEL',
  'SOLUTION',
  'AUTRE',
];

const EMPTY_DEFAULTS: MedicamentInput = {
  dci: '',
  atc_code: '',
  atc_libelle: '',
  nom_commercial: '',
  forme_galenique: 'COLLYRE',
  dosage_defaut: '',
  posologie_defaut: '',
  duree_defaut_jours: undefined,
  actif: true,
};

export function MedicamentEditDialog({
  open,
  onClose,
  medicament,
}: MedicamentEditDialogProps) {
  const { addNotification } = useNotifications();
  const isEdit = Boolean(medicament);
  const [showImport, setShowImport] = useState(false);

  const defaultValues: MedicamentInput = medicament
    ? {
        dci: medicament.dci,
        atc_code: medicament.atc_code,
        atc_libelle: medicament.atc_libelle,
        nom_commercial: medicament.nom_commercial,
        forme_galenique: medicament.forme_galenique,
        dosage_defaut: medicament.dosage_defaut,
        posologie_defaut: medicament.posologie_defaut,
        duree_defaut_jours: medicament.duree_defaut_jours ?? undefined,
        actif: medicament.actif,
      }
    : EMPTY_DEFAULTS;

  const form = useForm<MedicamentInput>({
    resolver: zodResolver(MedicamentInputSchema),
    defaultValues,
  });

  // Re-sync form when switching between edit/create
  useEffect(() => {
    if (open) form.reset(defaultValues);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, medicament?.id]);

  const { mutate: createMut, isPending: creating } = useCreateMedicament({
    onSuccess: () => {
      addNotification({
        type: 'success',
        title: 'Médicament créé',
      });
      onClose();
    },
  });
  const { mutate: updateMut, isPending: updating } = useUpdateMedicament({
    onSuccess: () => {
      addNotification({ type: 'success', title: 'Médicament mis à jour' });
      onClose();
    },
  });
  const { mutate: importMut, isPending: importing } =
    useImportMedicamentFromRxnorm({
      onSuccess: (imported) => {
        addNotification({
          type: 'success',
          title: 'Médicament importé depuis RxNorm',
          message: `${imported.dci} ajouté au référentiel local.`,
        });
        setShowImport(false);
        onClose();
      },
    });

  const isPending = creating || updating || importing;

  const onSubmit = (values: MedicamentInput) => {
    if (isEdit && medicament) {
      updateMut({ id: medicament.id, data: values });
    } else {
      createMut(values);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? `Modifier — ${medicament?.dci}` : 'Ajouter un médicament'}
          </DialogTitle>
        </DialogHeader>

        {/* Import RxNorm — uniquement en création */}
        {!isEdit && (
          <div className="mb-4 rounded-md border border-dashed border-border p-3">
            <button
              type="button"
              onClick={() => setShowImport((v) => !v)}
              className="flex w-full items-center gap-2 text-sm font-medium text-foreground"
            >
              <Search className="size-4" />
              {showImport
                ? "Masquer l'import RxNorm"
                : 'Importer depuis RxNorm'}
            </button>
            {showImport && (
              <div className="mt-3 space-y-2">
                <p className="text-xs text-muted-foreground">
                  Cherchez dans le catalogue RxNorm. Au clic, l&apos;entrée est
                  créée dans le référentiel local (forme galénique détectée
                  automatiquement).
                </p>
                <MedicamentSelector
                  value=""
                  onTextChange={() => undefined}
                  onSelect={(m) => {
                    importMut({
                      dci: m.dci,
                      forme_galenique: m.forme_galenique as FormeGalenique,
                      atc_code: m.atc_code ?? '',
                      atc_libelle: m.atc_libelle ?? '',
                      nom_commercial: m.nom_commercial ?? '',
                      dosage_defaut: m.dosage ?? '',
                      posologie_defaut: m.posologie_defaut ?? '',
                      duree_defaut_jours: m.duree_defaut_jours ?? undefined,
                    });
                  }}
                />
              </div>
            )}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="dci"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>DCI (WHO INN) *</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: timolol" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="forme_galenique"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forme galénique *</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner…" />
                      </SelectTrigger>
                      <SelectContent>
                        {FORMES.map((f) => (
                          <SelectItem key={f} value={f}>
                            {FORME_LABELS[f]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="nom_commercial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom commercial local</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: Timoptol" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="atc_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code ATC</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: S01ED01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="atc_libelle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Libellé ATC</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ex: Timolol — bêtabloquant antiglaucomateux"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="dosage_defaut"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dosage par défaut</FormLabel>
                    <FormControl>
                      <Input placeholder="ex: 0.5%" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duree_defaut_jours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée (jours)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        placeholder="30"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value === ''
                              ? undefined
                              : Number(e.target.value),
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="actif"
                render={() => (
                  <FormItem>
                    <FormLabel>Actif</FormLabel>
                    <FormControl>
                      <div className="flex h-9 items-center">
                        <Controller
                          control={form.control}
                          name="actif"
                          render={({ field: f }) => (
                            <Switch
                              checked={f.value ?? true}
                              onCheckedChange={f.onChange}
                            />
                          )}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="posologie_defaut"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Posologie par défaut</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={2}
                      placeholder="ex: 1 goutte 2 fois par jour"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Annuler
              </Button>
              <Button type="submit" disabled={isPending} className="gap-2">
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {isEdit ? 'Enregistrer' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
