'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
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
} from '@/components/ui/form';
import { slugify } from '@/lib/slugify';

import { useCreateSite, useUpdateSite } from '../api';
import { Site, SiteSchema } from '../types';

interface SiteFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  site?: Site | null;
}

export const SiteFormModal = ({
  open,
  onOpenChange,
  site,
}: SiteFormModalProps) => {
  const isEditing = !!site;
  const createSiteMutation = useCreateSite();
  const updateSiteMutation = useUpdateSite();

  const form = useForm<Site>({
    resolver: zodResolver(SiteSchema),
    defaultValues: {
      libelle: '',
      code: '',
      adresse: '',
      is_active: true,
    },
  });

  const libelle = form.watch('libelle');

  // Auto-slugify code when libelle changes (only if not editing or if code is empty)
  useEffect(() => {
    if (!isEditing && libelle) {
      form.setValue('code', slugify(libelle), { shouldValidate: true });
    }
  }, [libelle, isEditing, form]);

  useEffect(() => {
    if (site) {
      form.reset(site);
    } else {
      form.reset({
        libelle: '',
        code: '',
        adresse: '',
        is_active: true,
      });
    }
  }, [site, form, open]);

  const onSubmit = (values: Site) => {
    if (isEditing && site?.id) {
      updateSiteMutation.mutate(
        { siteId: site.id, data: values },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        },
      );
    } else {
      createSiteMutation.mutate(
        { data: values },
        {
          onSuccess: () => {
            onOpenChange(false);
            form.reset();
          },
        },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Modifier le site' : 'Ajouter un nouveau site'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="libelle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Libellé</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Dakar - Plateau" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Code</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: dakar-plateau" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="adresse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Adresse</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Adresse complète (optionnel)"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={
                  createSiteMutation.isPending || updateSiteMutation.isPending
                }
              >
                {createSiteMutation.isPending || updateSiteMutation.isPending
                  ? 'Chargement...'
                  : isEditing
                    ? 'Modifier'
                    : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
