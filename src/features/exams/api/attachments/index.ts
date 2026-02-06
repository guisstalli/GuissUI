import {
  queryOptions,
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

import type {
  PaginatedExamenSupplementaireList,
  ExamenSupplementaire,
} from '../../types';

// =============================================================================
// GET ATTACHMENTS
// =============================================================================

type GetAttachmentsParams = {
  clinicalExamId: number;
  limit?: number;
  offset?: number;
};

/**
 * Récupère la liste des pièces jointes d'un examen clinique
 */
export const getAttachments = ({
  clinicalExamId,
  ...params
}: GetAttachmentsParams): Promise<PaginatedExamenSupplementaireList> => {
  return api.get<PaginatedExamenSupplementaireList>(
    `/api/v1/depistage/clinical-examens/${clinicalExamId}/attachments/`,
    { params },
  );
};

/**
 * Query options pour les pièces jointes
 */
export const getAttachmentsQueryOptions = (params: GetAttachmentsParams) => {
  return queryOptions({
    queryKey: ['attachments', params.clinicalExamId, params],
    queryFn: () => getAttachments(params),
    enabled: !!params.clinicalExamId,
  });
};

type UseAttachmentsOptions = {
  clinicalExamId: number;
  limit?: number;
  offset?: number;
  enabled?: boolean;
};

/**
 * Hook React Query pour récupérer les pièces jointes
 */
export const useAttachments = ({
  clinicalExamId,
  limit,
  offset,
  enabled = true,
}: UseAttachmentsOptions) => {
  return useQuery({
    ...getAttachmentsQueryOptions({ clinicalExamId, limit, offset }),
    enabled: enabled && !!clinicalExamId,
  });
};

/**
 * Récupère une pièce jointe par son ID
 */
export const getAttachment = (id: number): Promise<ExamenSupplementaire> => {
  return api.get<ExamenSupplementaire>(`/api/v1/depistage/attachments/${id}/`);
};

export const getAttachmentQueryOptions = (id: number) => {
  return queryOptions({
    queryKey: ['attachment', id],
    queryFn: () => getAttachment(id),
    enabled: !!id,
  });
};

export const useAttachment = (id: number, enabled = true) => {
  return useQuery({
    ...getAttachmentQueryOptions(id),
    enabled: enabled && !!id,
  });
};

// =============================================================================
// UPLOAD ATTACHMENT
// =============================================================================

type UploadAttachmentParams = {
  clinicalExamId: number;
  file: File;
  description?: string;
};

/**
 * Upload une pièce jointe
 */
export const uploadAttachment = async ({
  clinicalExamId,
  file,
  description,
}: UploadAttachmentParams): Promise<ExamenSupplementaire> => {
  const formData = new FormData();
  formData.append('file', file);
  if (description) {
    formData.append('description', description);
  }

  return api.post<ExamenSupplementaire>(
    `/api/v1/depistage/clinical-examens/${clinicalExamId}/attachments/`,
    formData,
    { isFormData: true },
  );
};

type UseUploadAttachmentOptions = {
  mutationConfig?: MutationConfig<typeof uploadAttachment>;
};

export const useUploadAttachment = ({
  mutationConfig = {},
}: UseUploadAttachmentOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    mutationFn: uploadAttachment,
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({
        queryKey: ['attachments', variables.clinicalExamId],
      });
      addNotification({
        type: 'success',
        title: 'Fichier uploadé',
        message: `Le fichier ${data.original_filename} a été uploadé.`,
      });
      onSuccess?.(data, variables, ...args);
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message:
          "Impossible d'uploader le fichier. Vérifiez le format et la taille.",
      });
    },
    ...restConfig,
  });
};

// =============================================================================
// DELETE ATTACHMENT
// =============================================================================

type DeleteAttachmentParams = {
  id: number;
  clinicalExamId: number;
};

/**
 * Supprime une pièce jointe
 */
export const deleteAttachment = ({
  id,
}: DeleteAttachmentParams): Promise<void> => {
  return api.delete(`/api/v1/depistage/attachments/${id}/`);
};

type UseDeleteAttachmentOptions = {
  mutationConfig?: MutationConfig<typeof deleteAttachment>;
};

export const useDeleteAttachment = ({
  mutationConfig = {},
}: UseDeleteAttachmentOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    mutationFn: deleteAttachment,
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({
        queryKey: ['attachments', variables.clinicalExamId],
      });
      addNotification({
        type: 'success',
        title: 'Fichier supprimé',
        message: 'La pièce jointe a été supprimée.',
      });
      onSuccess?.(data, variables, ...args);
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de supprimer la pièce jointe.',
      });
    },
    ...restConfig,
  });
};
