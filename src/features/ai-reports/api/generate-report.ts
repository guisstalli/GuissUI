import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { GenerateReportResponse } from '../types';

type GenerateReportInput = {
  report_type?: string;
  prompt?: string;
  filters?: Record<string, unknown>;
  /** Document de référence : définit le FORMAT (structure), jamais les données */
  upload?: File;
};

/**
 * Demande de génération — 202 Accepted : le backend rend {report_id} et
 * génère en asynchrone (Celery). L'appelant ouvre le détail et polle.
 *
 * Multipart uniquement si un fichier est joint ; `filters` doit alors être
 * sérialisé en chaîne JSON (le serializer backend re-parse la chaîne).
 */
export const generateReport = (
  input: GenerateReportInput,
): Promise<GenerateReportResponse> => {
  if (input.upload) {
    const formData = new FormData();
    if (input.report_type) formData.append('report_type', input.report_type);
    if (input.prompt) formData.append('prompt', input.prompt);
    formData.append('filters', JSON.stringify(input.filters ?? {}));
    formData.append('upload', input.upload);
    return api.upload('/ai-reports/generate/', formData);
  }

  return api.post('/ai-reports/generate/', {
    report_type: input.report_type || undefined,
    prompt: input.prompt || undefined,
    filters: input.filters ?? {},
  });
};

export const useGenerateReport = ({
  mutationConfig,
}: {
  mutationConfig?: {
    onSuccess?: (response: GenerateReportResponse) => void;
  };
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: generateReport,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['ai-reports'] });
      mutationConfig?.onSuccess?.(response);
    },
  });
};
