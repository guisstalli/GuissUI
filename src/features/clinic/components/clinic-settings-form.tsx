'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Image as ImageIcon, Loader2, Save, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Textarea,
} from '@/components/ui/form';
import { useNotifications } from '@/components/ui/notifications';

import { useUpdateClinicSettings } from '../api/update-clinic-settings';
import {
  ClinicSettingsUpdateSchema,
  type ClinicSettings,
  type ClinicSettingsUpdateInput,
} from '../types/schemas';

interface ClinicSettingsFormProps {
  settings: ClinicSettings;
}

export function ClinicSettingsForm({ settings }: ClinicSettingsFormProps) {
  const { addNotification } = useNotifications();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(settings.logo);
  const [pendingLogo, setPendingLogo] = useState<File | null>(null);

  const { mutate, isPending } = useUpdateClinicSettings({
    onSuccess: () => {
      setPendingLogo(null);
      addNotification({
        type: 'success',
        title: 'Paramètres enregistrés',
        message: 'Les informations de la clinique ont été mises à jour.',
      });
    },
    onError: () =>
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de sauvegarder les paramètres.',
      }),
  });

  const form = useForm<ClinicSettingsUpdateInput>({
    resolver: zodResolver(ClinicSettingsUpdateSchema),
    defaultValues: {
      name: settings.name ?? '',
      address: settings.address ?? '',
      phone: settings.phone ?? '',
      email: settings.email ?? '',
      website: settings.website ?? '',
      numero_etablissement: settings.numero_etablissement ?? '',
      mentions_legales: settings.mentions_legales ?? '',
    },
  });

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingLogo(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const onSubmit = (values: ClinicSettingsUpdateInput) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });
    if (pendingLogo) {
      formData.append('logo', pendingLogo);
    }
    mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted">
          {logoPreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoPreview}
              alt="Logo clinique"
              className="size-full object-contain"
            />
          ) : (
            <ImageIcon className="size-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Logo</p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG ou SVG — affiché en haut des ordonnances et factures.
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleLogoChange}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="mr-2 size-4" aria-hidden="true" />
          {pendingLogo ? 'Changer' : 'Téléverser'}
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nom de la clinique</FormLabel>
                <FormControl>
                  <Input placeholder="Guiss-Talli" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Adresse</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="UFR Sciences de la Santé, Université Iba Der Thiam, Thiès"
                    rows={2}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Téléphone</FormLabel>
                  <FormControl>
                    <Input placeholder="+221 33 ..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="contact@clinique.sn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site web</FormLabel>
                  <FormControl>
                    <Input placeholder="https://clinique.sn" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="numero_etablissement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>N° établissement</FormLabel>
                  <FormControl>
                    <Input placeholder="optionnel" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="mentions_legales"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mentions légales (pied de page)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Notice de confidentialité, mentions légales..."
                    rows={3}
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
    </div>
  );
}
