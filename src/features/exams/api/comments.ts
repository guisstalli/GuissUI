import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
} from '@tanstack/react-query';

import { api } from '@/lib/api-client';

export type ExamenType = 'adult' | 'child';

export type CommentAttachment = {
  id: number;
  nom: string;
  url: string;
};

export type ExamComment = {
  id: number;
  /** `null` lorsque le commentaire a été supprimé : la trace demeure. */
  corps: string | null;
  auteur_id: number;
  auteur_email: string;
  parent_id: number | null;
  attachments: CommentAttachment[];
  is_deleted: boolean;
  is_edited: boolean;
  created: string;
  edited_at: string | null;
  replies: ExamComment[];
};

const threadKey = (examenType: ExamenType, examenId: number): QueryKey => [
  'exam-comments',
  examenType,
  examenId,
];

export const getExamComments = (
  examenType: ExamenType,
  examenId: number,
): Promise<ExamComment[]> =>
  api.get(`/depistage/examens/${examenType}/${examenId}/comments/`);

export const useExamComments = (examenType: ExamenType, examenId: number) =>
  useQuery({
    queryKey: threadKey(examenType, examenId),
    queryFn: () => getExamComments(examenType, examenId),
    enabled: Number.isFinite(examenId) && examenId > 0,
  });

/**
 * Les trois mutations invalident le fil entier plutôt que de le rapiécer
 * localement : un commentaire peut arriver d'un collègue entre-temps, et un
 * dossier se lit à plusieurs.
 */
function useThreadMutation<TVars>(
  examenType: ExamenType,
  examenId: number,
  mutationFn: (vars: TVars) => Promise<unknown>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: threadKey(examenType, examenId),
      }),
  });
}

export const useCreateExamComment = (
  examenType: ExamenType,
  examenId: number,
) =>
  useThreadMutation(
    examenType,
    examenId,
    (payload: { corps: string; parent_id?: number; file_ids?: number[] }) =>
      api.post(
        `/depistage/examens/${examenType}/${examenId}/comments/`,
        payload,
      ),
  );

export const useUpdateExamComment = (
  examenType: ExamenType,
  examenId: number,
) =>
  useThreadMutation(
    examenType,
    examenId,
    ({ commentId, corps }: { commentId: number; corps: string }) =>
      api.patch(`/depistage/comments/${commentId}/`, { corps }),
  );

export const useDeleteExamComment = (
  examenType: ExamenType,
  examenId: number,
) =>
  useThreadMutation(
    examenType,
    examenId,
    ({ commentId }: { commentId: number }) =>
      api.delete(`/depistage/comments/${commentId}/`),
  );
