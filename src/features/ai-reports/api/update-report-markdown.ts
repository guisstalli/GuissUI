import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

import type { ReportDetail } from '../types';

/**
 * Corrige le texte d'un rapport au statut brouillon.
 *
 * La relecture se faisait jusqu'ici dans un traitement de texte : le médecin
 * téléchargeait le DOCX, le corrigeait, puis approuvait. La correction sortait
 * de la plateforme et n'était jamais comparée au texte généré — impossible de
 * savoir ce que le modèle rate systématiquement.
 *
 * Le serveur conserve le texte d'origine à la première correction et enregistre
 * l'écart section par section au moment de l'approbation.
 */
export const updateReportMarkdown = ({
  reportId,
  markdown,
}: {
  reportId: number;
  markdown: string;
}): Promise<ReportDetail> =>
  api.patch(`/ai-reports/${reportId}/markdown/`, { markdown });

export const useUpdateReportMarkdown = ({
  mutationConfig,
}: {
  mutationConfig?: {
    onSuccess?: (report: ReportDetail) => void;
    onError?: () => void;
  };
} = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateReportMarkdown,
    onSuccess: (report) => {
      // Le préfixe couvre la liste ET le détail (['ai-reports', 'detail', id]).
      queryClient.invalidateQueries({ queryKey: ['ai-reports'] });
      mutationConfig?.onSuccess?.(report);
    },
    onError: mutationConfig?.onError,
  });
};
