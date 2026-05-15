import { useMutation } from '@tanstack/react-query';

import { useNotifications } from '@/components/ui/notifications';
import { downloadPdf } from '@/utils/download-pdf';

type PatientReportType = 'adultes' | 'enfants' | 'tous';

interface DownloadPatientReportParams {
  patientId: number;
  type?: PatientReportType;
}

export const useDownloadPatientReport = () => {
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: ({ patientId, type = 'tous' }: DownloadPatientReportParams) => {
      const params = type !== 'tous' ? `?type=${type}` : '';
      return downloadPdf(
        `/depistage/patients/${patientId}/examens/pdf/${params}`,
        `examens-patient-${patientId}.pdf`,
      );
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de générer le rapport PDF du patient.',
      });
    },
  });
};

interface DownloadMultipleExamsParams {
  ids: number[];
  type: 'adulte' | 'enfant';
}

export const useDownloadMultipleExamsPdf = () => {
  const { addNotification } = useNotifications();

  return useMutation({
    mutationFn: ({ ids, type }: DownloadMultipleExamsParams) =>
      downloadPdf(
        '/depistage/examens/rapport-multiple/pdf/',
        'rapport-selection.pdf',
        {
          method: 'POST',
          body: { ids, type },
        },
      ),
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de générer le rapport PDF multiple.',
      });
    },
  });
};
