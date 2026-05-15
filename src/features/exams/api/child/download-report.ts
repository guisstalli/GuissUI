import { useMutation } from '@tanstack/react-query';

import { useNotifications } from '@/components/ui/notifications';
import { downloadPdf } from '@/utils/download-pdf';

export const useDownloadChildReport = () => {
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: (examId: number) =>
      downloadPdf(
        `/depistage/examens/enfants/${examId}/report/pdf/`,
        `rapport-enfant-${examId}.pdf`,
      ),
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de générer le rapport PDF enfant.',
      });
    },
  });
};

export const useDownloadChildConclusion = () => {
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: (examId: number) =>
      downloadPdf(
        `/depistage/examens/enfants/${examId}/conclusion/pdf/`,
        `conclusion-enfant-${examId}.pdf`,
      ),
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de générer le PDF de conclusion enfant.',
      });
    },
  });
};
