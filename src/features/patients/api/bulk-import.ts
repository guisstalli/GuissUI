import { queryOptions, useQuery, useMutation } from '@tanstack/react-query';

import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

import type { BulkPatientImport, TaskResponse, TaskStatus } from '../types';

/**
 * Import bulk de patients (tâche asynchrone Celery)
 */
export const bulkImportPatients = (
  data: BulkPatientImport,
): Promise<TaskResponse> => {
  return api.post<TaskResponse>(
    '/api/v1/depistage/patients/bulk-import/',
    data,
  );
};

/**
 * Récupère le statut d'une tâche Celery
 */
export const getTaskStatus = (taskId: string): Promise<TaskStatus> => {
  return api.get<TaskStatus>(`/api/v1/depistage/tasks/${taskId}/status/`);
};

/**
 * Query options pour le statut d'une tâche
 */
export const getTaskStatusQueryOptions = (taskId: string) => {
  return queryOptions({
    queryKey: ['task', taskId],
    queryFn: () => getTaskStatus(taskId),
    enabled: !!taskId,
    refetchInterval: (query) => {
      // Arrêter le polling si la tâche est terminée
      const status = query.state.data?.status;
      if (status === 'SUCCESS' || status === 'FAILURE') {
        return false;
      }
      // Polling toutes les 2 secondes pendant l'exécution
      return 2000;
    },
  });
};

type UseTaskStatusOptions = {
  taskId: string;
  enabled?: boolean;
};

/**
 * Hook React Query pour suivre le statut d'une tâche d'import
 */
export const useTaskStatus = ({
  taskId,
  enabled = true,
}: UseTaskStatusOptions) => {
  return useQuery({
    ...getTaskStatusQueryOptions(taskId),
    enabled: enabled && !!taskId,
  });
};

type UseBulkImportPatientsOptions = {
  mutationConfig?: MutationConfig<typeof bulkImportPatients>;
};

/**
 * Hook React Query mutation pour lancer un import bulk
 */
export const useBulkImportPatients = ({
  mutationConfig = {},
}: UseBulkImportPatientsOptions = {}) => {
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    mutationFn: bulkImportPatients,
    onSuccess: (data, ...args) => {
      addNotification({
        type: 'info',
        title: 'Import lancé',
        message: `L'import de ${args[0].patients.length} patients a été lancé. ID de tâche: ${data.task_id}`,
      });
      onSuccess?.(data, ...args);
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: "Impossible de lancer l'import. Vérifiez les données.",
      });
    },
    ...restConfig,
  });
};
