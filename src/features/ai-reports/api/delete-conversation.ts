import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

/** Suppression définitive (messages inclus). Owner-only, étrangère → 404. */
export const deleteConversation = (conversationId: number): Promise<void> =>
  api.delete(`/ai-reports/conversations/${conversationId}/`);

type UseDeleteConversationOptions = {
  mutationConfig?: MutationConfig<typeof deleteConversation>;
};

export const useDeleteConversation = ({
  mutationConfig = {},
}: UseDeleteConversationOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    mutationFn: deleteConversation,
    onSuccess: (data, conversationId, ...args) => {
      queryClient.removeQueries({
        queryKey: ['ai-conversations', 'detail', conversationId],
      });
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      onSuccess?.(data, conversationId, ...args);
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de supprimer la conversation.',
      });
    },
    ...restConfig,
  });
};
