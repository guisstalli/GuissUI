'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { differenceInYears, format, parse } from 'date-fns';
import { ArrowLeft, ArrowRight, Baby, CalendarIcon, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import { useCreatePatient } from '@/features/patients/api';
import { SEX_LABELS } from '@/features/patients/types/schemas';
import { cn } from '@/lib/utils';

export type PatientType = 'adult' | 'child' | null;

// Schéma de validation du formulaire avec date de naissance
const patientFormSchema = z.object({
  last_name: z.string().min(1, 'Le nom est requis'),
  name: z.string().min(1, 'Le prénom est requis'),
  date_de_naissance: z.string().min(1, 'La date de naissance est requise'),
  sex: z.enum(['H', 'F', 'A'], {
    required_error: 'Le sexe est requis',
  }),
  phone_number: z.string().optional(),
});

export type PatientFormValues = z.infer<typeof patientFormSchema>;

/**
 * Calcule l'âge à partir d'une date de naissance
 */
function calculateAge(dateOfBirth: string): number {
  if (!dateOfBirth) return 0;
  const birthDate = parse(dateOfBirth, 'yyyy-MM-dd', new Date());
  return differenceInYears(new Date(), birthDate);
}

/**
 * Détermine si le patient est adulte ou enfant basé sur la date de naissance
 */
function getPatientType(dateOfBirth: string): PatientType {
  if (!dateOfBirth) return null;
  const age = calculateAge(dateOfBirth);
  return age >= 18 ? 'adult' : 'child';
}

interface NewPatientModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPatientCreated?: () => void;
}

export function NewPatientModal({
  open,
  onOpenChange,
  onPatientCreated,
}: NewPatientModalProps) {
  const [step, setStep] = useState<'type' | 'form'>('type');
  const [patientType, setPatientType] = useState<PatientType>(null);

  const createPatientMutation = useCreatePatient({
    mutationConfig: {
      onSuccess: () => {
        handleClose();
        onPatientCreated?.();
      },
    },
  });

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      last_name: '',
      name: '',
      date_de_naissance: '',
      sex: undefined,
      phone_number: '',
    },
  });

  const watchedDateOfBirth = form.watch('date_de_naissance');

  // Calculer l'âge et le type de patient basé sur la date de naissance
  const calculatedAge = useMemo(
    () => calculateAge(watchedDateOfBirth),
    [watchedDateOfBirth],
  );

  const derivedPatientType = useMemo(
    () => getPatientType(watchedDateOfBirth) || patientType,
    [watchedDateOfBirth, patientType],
  );

  const handleTypeSelect = (type: PatientType) => {
    setPatientType(type);
  };

  const handleContinueToForm = () => {
    if (patientType) {
      // Pré-remplir avec une date par défaut basée sur le type sélectionné
      if (!form.getValues('date_de_naissance')) {
        const today = new Date();
        if (patientType === 'adult') {
          // Adulte : 25 ans par défaut
          const adultDate = new Date(
            today.getFullYear() - 25,
            today.getMonth(),
            today.getDate(),
          );
          form.setValue('date_de_naissance', format(adultDate, 'yyyy-MM-dd'));
        } else {
          // Enfant : 10 ans par défaut
          const childDate = new Date(
            today.getFullYear() - 10,
            today.getMonth(),
            today.getDate(),
          );
          form.setValue('date_de_naissance', format(childDate, 'yyyy-MM-dd'));
        }
      }
      setStep('form');
    }
  };

  const handleBackToType = () => {
    setStep('type');
  };

  const handleClose = () => {
    setStep('type');
    setPatientType(null);
    form.reset();
    onOpenChange(false);
  };

  const onSubmit = (data: PatientFormValues) => {
    createPatientMutation.mutate({
      last_name: data.last_name,
      name: data.name,
      date_de_naissance: data.date_de_naissance,
      sex: data.sex,
      phone_number: data.phone_number || undefined,
    });
  };

  // Calculer la date maximale (aujourd'hui) et minimale (150 ans)
  const today = format(new Date(), 'yyyy-MM-dd');
  const minDate = format(
    new Date(new Date().getFullYear() - 150, 0, 1),
    'yyyy-MM-dd',
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        {step === 'type' ? (
          <>
            <DialogHeader>
              <DialogTitle>Nouveau patient</DialogTitle>
              <DialogDescription>
                Le patient est-il un adulte ou un enfant ?
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-3 py-4">
              <button
                type="button"
                onClick={() => handleTypeSelect('adult')}
                className={cn(
                  'flex items-start gap-4 rounded-lg border p-4 text-left transition-colors',
                  'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  patientType === 'adult'
                    ? 'border-primary bg-primary/5'
                    : 'border-border',
                )}
                aria-pressed={patientType === 'adult'}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <User
                    className="size-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">Patient adulte</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    18 ans et plus
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTypeSelect('child')}
                className={cn(
                  'flex items-start gap-4 rounded-lg border p-4 text-left transition-colors',
                  'hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  patientType === 'child'
                    ? 'border-primary bg-primary/5'
                    : 'border-border',
                )}
                aria-pressed={patientType === 'child'}
              >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <Baby
                    className="size-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                <div>
                  <p className="font-medium text-foreground">Patient enfant</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    Moins de 18 ans
                  </p>
                </div>
              </button>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Annuler
              </Button>
              <Button onClick={handleContinueToForm} disabled={!patientType}>
                Continuer
                <ArrowRight className="ml-1.5 size-4" aria-hidden="true" />
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Informations du patient</DialogTitle>
              <DialogDescription>
                Entrez les informations d&apos;identité et de contact du
                patient.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 py-4"
              >
                {/* Section Identité */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-foreground">
                    Identité
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="last_name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Nom <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Entrez le nom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Prénom <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Entrez le prénom" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date_de_naissance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Date de naissance{' '}
                            <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                type="date"
                                min={minDate}
                                max={today}
                                className="pl-10"
                                {...field}
                              />
                              <CalendarIcon className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sex"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Sexe <span className="text-destructive">*</span>
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Sélectionnez" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="H">{SEX_LABELS.H}</SelectItem>
                              <SelectItem value="F">{SEX_LABELS.F}</SelectItem>
                              <SelectItem value="A">{SEX_LABELS.A}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Type de patient dérivé */}
                  {watchedDateOfBirth && (
                    <div className="bg-muted/30 rounded-lg border border-border px-3 py-2">
                      <p className="text-sm text-muted-foreground">
                        Âge :{' '}
                        <span className="font-medium text-foreground">
                          {calculatedAge} ans
                        </span>
                        <span className="mx-2">•</span>
                        Type :{' '}
                        <span className="font-medium text-foreground">
                          {derivedPatientType === 'adult' ? 'Adulte' : 'Enfant'}
                        </span>
                        <span className="ml-1 text-xs text-muted-foreground">
                          (calculé automatiquement)
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                {/* Section Contact */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-sm font-medium text-foreground">
                    Contact{' '}
                    <span className="font-normal text-muted-foreground">
                      (optionnel)
                    </span>
                  </h3>

                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro de téléphone</FormLabel>
                        <FormControl>
                          <Input
                            type="tel"
                            placeholder="+221 77 000 00 00"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleBackToType}
                  >
                    <ArrowLeft className="mr-1.5 size-4" aria-hidden="true" />
                    Retour
                  </Button>
                  <Button
                    type="submit"
                    disabled={createPatientMutation.isPending}
                  >
                    {createPatientMutation.isPending
                      ? 'Création...'
                      : 'Créer le patient'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
