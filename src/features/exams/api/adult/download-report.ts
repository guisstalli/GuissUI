import { useMutation } from '@tanstack/react-query';

import { useNotifications } from '@/components/ui/notifications';
import { downloadPdf } from '@/utils/download-pdf';

export const useDownloadAdultReport = () => {
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: (examId: number) =>
      downloadPdf(
        `/depistage/examens/adultes/${examId}/report/pdf/`,
        `rapport-adulte-${examId}.pdf`,
      ),
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de générer le rapport PDF.',
      });
    },
  });
};

export const useDownloadAdultConclusion = () => {
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: (examId: number) =>
      downloadPdf(
        `/depistage/examens/adultes/${examId}/conclusion/pdf/`,
        `conclusion-adulte-${examId}.pdf`,
      ),
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de générer le PDF de conclusion.',
      });
    },
  });
};
