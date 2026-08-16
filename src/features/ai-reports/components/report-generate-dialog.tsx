'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Sparkles } from 'lucide-react';
import { useRef } from 'react';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from '@/components/ui/form';

import { useGenerateReport } from '../api/generate-report';
import { useCapabilities } from '../api/get-capabilities';
import {
  generateReportFormSchema,
  type GenerateReportFormValues,
} from '../types';

const NO_TYPE_VALUE = '__none__';

interface ReportGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Appelé avec l'id du rapport créé (202 Accepted) — l'appelant navigue vers le détail. */
  onGenerated: (reportId: number) => void;
}

export function ReportGenerateDialog({
  open,
  onOpenChange,
  onGenerated,
}: ReportGenerateDialogProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { data: capabilities } = useCapabilities({ enabled: open });

  const form = useForm<GenerateReportFormValues>({
    resolver: zodResolver(generateReportFormSchema),
    defaultValues: { report_type: '', prompt: '' },
  });

  const generateMutation = useGenerateReport({
    mutationConfig: {
      onSuccess: (response) => {
        form.reset();
        if (fileInputRef.current) fileInputRef.current.value = '';
        onOpenChange(false);
        onGenerated(response.report_id);
      },
    },
  });

  const onSubmit = (values: GenerateReportFormValues) => {
    generateMutation.mutate({
      report_type: values.report_type || undefined,
      prompt: values.prompt || undefined,
      upload: values.upload,
    });
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      form.reset();
      if (fileInputRef.current) fileInputRef.current.value = '';
      generateMutation.reset();
    }
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Générer un rapport</DialogTitle>
          <DialogDescription>
            La génération est asynchrone : le rapport passera en
            «&nbsp;Brouillon (à relire)&nbsp;» une fois prêt, puis devra être
            approuvé avant diffusion.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="report_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type de rapport</FormLabel>
                  <Select
                    value={field.value || NO_TYPE_VALUE}
                    onValueChange={(v) =>
                      field.onChange(v === NO_TYPE_VALUE ? '' : v)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Question libre" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={NO_TYPE_VALUE}>
                        Question libre (décrire ci-dessous)
                      </SelectItem>
                      {(capabilities ?? []).map((capability) => (
                        <SelectItem
                          key={capability.key}
                          value={capability.key}
                          disabled={!capability.healthy}
                        >
                          {capability.display_name}
                          {!capability.healthy ? ' — indisponible' : ''}
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
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description / consignes (optionnel)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder="Ex. : activité de dépistage du mois écoulé, par site, avec les anomalies détectées…"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="upload"
              render={({ field: { onChange } }) => (
                <FormItem>
                  <FormLabel>Document de référence (optionnel)</FormLabel>
                  <FormControl>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".docx,.pdf,.md,.txt"
                      className="block w-full cursor-pointer rounded-md border border-input bg-background text-sm file:mr-3 file:cursor-pointer file:rounded-l-md file:border-0 file:bg-muted file:px-3 file:py-2 file:text-sm file:font-medium"
                      onChange={(event) =>
                        onChange(event.target.files?.[0] ?? undefined)
                      }
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Définit le format attendu (structure, sections) — jamais les
                    données.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {generateMutation.isError && (
              <p className="text-sm text-destructive" role="alert">
                {generateMutation.error instanceof Error
                  ? generateMutation.error.message
                  : 'La demande de génération a échoué. Réessayez.'}
              </p>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={generateMutation.isPending}
              >
                Annuler
              </Button>
              <Button type="submit" disabled={generateMutation.isPending}>
                {generateMutation.isPending ? (
                  <Loader2 className="mr-1.5 size-4 animate-spin" aria-hidden />
                ) : (
                  <Sparkles className="mr-1.5 size-4" aria-hidden />
                )}
                Générer
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
