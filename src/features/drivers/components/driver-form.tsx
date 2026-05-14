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
  DriverCreateSchema,
  INSTRUCTION_VALUES,
  NIVEAU_INSTRUCTION_VALUES,
  PRISE_EN_CHARGE_VALUES,
  REGIONS,
  SERVICE_VALUES,
  TYPE_PERMIS_VALUES,
  VEHICULE_VALUES,
  type DriverCreate,
} from '../types/schemas';

interface DriverFormProps {
  defaultValues?: Partial<DriverCreate>;
  onSubmit: (data: DriverCreate) => void;
  isPending?: boolean;
  isEdit?: boolean;
}

const SEX_LABELS = { H: 'Homme', F: 'Femme', A: 'Anonyme' } as const;
const TYPE_PERMIS_LABELS: Record<string, string> = {
  Leger: 'Léger',
  Lourd: 'Lourd',
  Autres: 'Autres (préciser)',
};
const SERVICE_LABELS: Record<string, string> = {
  Public: 'Public',
  Prive: 'Privé',
  Particulier: 'Particulier',
};
const VEHICULE_LABELS: Record<string, string> = {
  Leger: 'Léger',
  Lourd: 'Lourd',
  Autres: 'Autres',
};
const INSTRUCTION_LABELS: Record<string, string> = {
  Française: 'Française',
  Arabe: 'Arabe',
};
const NIVEAU_LABELS: Record<string, string> = {
  Primaire: 'Primaire',
  Secondaire: 'Secondaire',
  Superieure: 'Supérieure',
  Autres: 'Autres',
  Aucune: 'Aucune',
};
const PRISE_EN_CHARGE_LABELS: Record<string, string> = {
  GRATUIT: 'GRATUIT',
  PAF: 'PAF',
  Assurance: 'Assurance',
  IB: 'IB',
  Sociéte: 'Société',
  IMP: 'IMP',
  CMU: 'CMU',
};

const DEFAULT_VALUES: DriverCreate = {
  patient: {
    name: '',
    last_name: '',
    date_de_naissance: '',
    sex: 'H',
    phone_number: '',
  },
  numero_permis: '',
  type_permis: 'Leger',
  autre_type_permis: '',
  date_delivrance_permis: '',
  date_peremption_permis: '',
  transporteur_professionnel: false,
  service: 'Public',
  annees_experience: 0,
  type_vehicule_conduit: 'Leger',
  type_instruction_suivie: 'Française',
  niveau_instruction: 'Primaire',
  prise_en_charge: null,
  zone_de_residence: 'Dakar',
};

export function DriverForm({
  defaultValues,
  onSubmit,
  isPending,
  isEdit,
}: DriverFormProps) {
  const form = useForm<DriverCreate>({
    resolver: zodResolver(DriverCreateSchema),
    defaultValues: { ...DEFAULT_VALUES, ...defaultValues },
  });

  const currentTypePermis = form.watch('type_permis');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Section Identité patient */}
        {!isEdit && (
          <div className="space-y-4">
            <h3 className="border-b pb-2 text-sm font-semibold">
              Identité du patient
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="patient.name"
                render={({ field }) => (
                  <FormItem>
                    {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
                    <FormLabel>
                      Prénom <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Prénom" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="patient.last_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nom <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Nom de famille" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="patient.date_de_naissance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Date de naissance{' '}
                      <span className="text-destructive">*</span>
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
                name="patient.sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Sexe <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {(['H', 'F', 'A'] as const).map((s) => (
                          <SelectItem key={s} value={s}>
                            {SEX_LABELS[s]}
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
                name="patient.phone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Téléphone <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="+221 XX XXX XX XX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
        )}

        {/* Section Permis */}
        <div className="space-y-4">
          <h3 className="border-b pb-2 text-sm font-semibold">
            Permis de conduire
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="numero_permis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    N° de permis <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: SN-12345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type_permis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Type de permis <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {TYPE_PERMIS_VALUES.map((v) => (
                        <SelectItem key={v} value={v}>
                          {TYPE_PERMIS_LABELS[v]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            {currentTypePermis === 'Autres' && (
              <FormField
                control={form.control}
                name="autre_type_permis"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel>
                      Préciser le type{' '}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Type de permis spécifique"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="date_delivrance_permis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Date de délivrance{' '}
                    <span className="text-destructive">*</span>
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
              name="date_peremption_permis"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Date de péremption{' '}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section Activité */}
        <div className="space-y-4">
          <h3 className="border-b pb-2 text-sm font-semibold">
            Activité professionnelle
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Secteur <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {SERVICE_VALUES.map((v) => (
                        <SelectItem key={v} value={v}>
                          {SERVICE_LABELS[v]}
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
              name="type_vehicule_conduit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Type de véhicule <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {VEHICULE_VALUES.map((v) => (
                        <SelectItem key={v} value={v}>
                          {VEHICULE_LABELS[v]}
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
              name="annees_experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Années d&apos;expérience{' '}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="transporteur_professionnel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Transporteur professionnel</FormLabel>
                  <Select
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(v === 'true')}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="true">Oui</SelectItem>
                      <SelectItem value="false">Non</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Section Profil */}
        <div className="space-y-4">
          <h3 className="border-b pb-2 text-sm font-semibold">Profil</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="type_instruction_suivie"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Type d&apos;instruction{' '}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {INSTRUCTION_VALUES.map((v) => (
                        <SelectItem key={v} value={v}>
                          {INSTRUCTION_LABELS[v]}
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
              name="niveau_instruction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Niveau d&apos;instruction{' '}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {NIVEAU_INSTRUCTION_VALUES.map((v) => (
                        <SelectItem key={v} value={v}>
                          {NIVEAU_LABELS[v]}
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
              name="zone_de_residence"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Zone de résidence{' '}
                    <span className="text-destructive">*</span>
                  </FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {REGIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
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
              name="prise_en_charge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prise en charge</FormLabel>
                  <Select
                    value={field.value ?? ''}
                    onValueChange={(v) => field.onChange(v || null)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner…" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">—</SelectItem>
                      {PRISE_EN_CHARGE_VALUES.map((v) => (
                        <SelectItem key={v} value={v}>
                          {PRISE_EN_CHARGE_LABELS[v]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="hover:bg-primary/90 inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm disabled:pointer-events-none disabled:opacity-50"
          >
            {isPending
              ? 'Enregistrement…'
              : isEdit
                ? 'Mettre à jour'
                : 'Créer le conducteur'}
          </button>
        </div>
      </form>
    </Form>
  );
}
