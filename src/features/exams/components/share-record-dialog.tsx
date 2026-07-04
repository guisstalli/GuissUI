'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Copy, Loader2, Share2 } from 'lucide-react';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog/dialog';
import { Label } from '@/components/ui/form/label';
import { Switch } from '@/components/ui/form/switch';
import { Input } from '@/components/ui/input';
import { useNotifications } from '@/components/ui/notifications/notifications-store';
import {
  shareCreateInputSchema,
  useCreateShareLink,
  type ShareExamType,
  type ShareLink,
} from '@/features/exams/api/create-share-link';

// Dérivé du schéma d'entrée de l'API (source unique) : on réutilise la
// validation de to_phone/to_email et on ne redéfinit que les champs à
// coercition/messages spécifiques au formulaire (M15 — plus de schéma dupliqué).
const shareFormSchema = shareCreateInputSchema
  .pick({ to_phone: true, to_email: true })
  .extend({
    ttl_hours: z.coerce
      .number({ invalid_type_error: 'Durée requise' })
      .int('Nombre entier requis')
      .min(1, 'Minimum 1 heure')
      .max(8760, 'Maximum 8760 heures (1 an)'),
    notify: z.boolean(),
  });

type ShareFormValues = z.infer<typeof shareFormSchema>;
type ShareFormInput = z.input<typeof shareFormSchema>;

const DEFAULT_TTL_HOURS = 48;

interface ShareRecordDialogProps {
  /** Type d'examen ciblé (`adulte` / `enfant`). */
  examType: ShareExamType;
  /** ID de l'examen à partager. */
  examId: number;
  /** Téléphone du patient (pré-rempli si connu ; sinon celui du dossier côté API). */
  defaultPhone?: string;
}

/**
 * Dialog « Partager le dossier » — crée un lien public à token et l'affiche.
 * Le gating RBAC (DOCTEUR/ADMIN) est appliqué au point d'appel via `<Can>`.
 */
export function ShareRecordDialog({
  examType,
  examId,
  defaultPhone = '',
}: ShareRecordDialogProps) {
  const [open, setOpen] = useState(false);
  const [result, setResult] = useState<ShareLink | null>(null);
  const [copied, setCopied] = useState(false);
  // Le lien n'est affiché qu'une fois : on avertit si l'utilisateur ferme sans
  // jamais l'avoir copié (il ne pourra plus le récupérer).
  const [copiedOnce, setCopiedOnce] = useState(false);
  const { addNotification } = useNotifications();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ShareFormInput, unknown, ShareFormValues>({
    resolver: zodResolver(shareFormSchema),
    defaultValues: {
      ttl_hours: DEFAULT_TTL_HOURS,
      to_phone: defaultPhone,
      to_email: '',
      notify: true,
    },
  });

  const {
    mutate: createShareLink,
    isPending,
    error,
    reset: resetMutation,
  } = useCreateShareLink({
    onSuccess: (data) => {
      setResult(data);
      addNotification({
        type: 'success',
        title: 'Lien de partage créé',
        message: 'Le lien du dossier a été généré avec succès.',
      });
    },
  });

  function resetAll() {
    setResult(null);
    setCopied(false);
    setCopiedOnce(false);
    resetMutation();
    reset({
      ttl_hours: DEFAULT_TTL_HOURS,
      to_phone: defaultPhone,
      to_email: '',
      notify: true,
    });
  }

  function handleOpenChange(next: boolean) {
    // Fermeture alors qu'un lien a été généré mais jamais copié → on prévient
    // que le lien sera perdu (pas de récupération possible ensuite).
    if (!next && result && !copiedOnce) {
      addNotification({
        type: 'warning',
        title: 'Lien non copié',
        message:
          "Le lien n'a pas été copié — il ne pourra plus être récupéré. Régénérez-en un si besoin.",
      });
    }
    setOpen(next);
    if (!next) resetAll();
  }

  function onSubmit(values: ShareFormValues) {
    createShareLink({
      exam_type: examType,
      exam_id: examId,
      ttl_hours: values.ttl_hours,
      to_phone: values.to_phone || undefined,
      to_email: values.to_email || undefined,
      notify: values.notify,
    });
  }

  async function copyLink() {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.url);
      setCopied(true);
      setCopiedOnce(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      addNotification({
        type: 'error',
        title: 'Copie impossible',
        message: 'Copiez le lien manuellement.',
      });
    }
  }

  const errorMessage =
    error instanceof Error
      ? error.message
      : error
        ? 'Une erreur est survenue lors de la création du lien.'
        : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Share2 className="mr-2 size-4" aria-hidden="true" />
          Partager le dossier
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Partager le dossier</DialogTitle>
          <DialogDescription>
            Génère un lien sécurisé à durée limitée, envoyé au patient par
            WhatsApp/email. Le lien donne accès au PDF du dossier sans compte.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="share-generated-link">Lien généré</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="share-generated-link"
                  readOnly
                  value={result.url}
                  className="font-mono text-xs"
                  onFocus={(e) => e.currentTarget.select()}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyLink}
                  aria-label="Copier le lien"
                >
                  {copied ? (
                    <Check className="size-4 text-emerald-600" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="text-xs text-emerald-600">Lien copié.</p>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Expire le{' '}
              {new Date(result.expires_at).toLocaleString('fr-FR', {
                dateStyle: 'long',
                timeStyle: 'short',
              })}
              .
            </p>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Fermer
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="share-ttl">Durée de validité (heures)</Label>
              <Controller
                control={control}
                name="ttl_hours"
                render={({ field }) => (
                  <Input
                    id="share-ttl"
                    type="number"
                    min={1}
                    max={8760}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.value)}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
              {errors.ttl_hours && (
                <p className="text-xs text-destructive">
                  {errors.ttl_hours.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="share-phone">Téléphone (optionnel)</Label>
              <Input
                id="share-phone"
                type="tel"
                placeholder="Défaut : téléphone du dossier"
                {...register('to_phone')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="share-email">Email (optionnel)</Label>
              <Input
                id="share-email"
                type="email"
                placeholder="patient@exemple.sn"
                {...register('to_email')}
              />
              {errors.to_email && (
                <p className="text-xs text-destructive">
                  {errors.to_email.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="share-notify">Notifier le patient</Label>
                <p className="text-xs text-muted-foreground">
                  Envoyer le lien par WhatsApp/email.
                </p>
              </div>
              <Controller
                control={control}
                name="notify"
                render={({ field }) => (
                  <Switch
                    id="share-notify"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

            {errorMessage && (
              <div className="border-destructive/30 bg-destructive/10 rounded-md border p-3 text-sm text-destructive">
                {errorMessage}
              </div>
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
              <Button type="submit" disabled={isPending}>
                {isPending && (
                  <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                )}
                Générer le lien
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
