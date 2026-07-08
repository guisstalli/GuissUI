import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useNotifications } from '@/components/ui/notifications';
import { api } from '@/lib/api-client';
import { MutationConfig } from '@/lib/react-query';

import type { ConversationListItem } from '../types';

/** Renommage (le titre auto = première question est souvent mauvais). */
export const renameConversation = ({
  conversationId,
  title,
}: {
  conversationId: number;
  title: string;
}): Promise<Omit<ConversationListItem, 'message_count'>> =>
  api.patch(`/ai-reports/conversations/${conversationId}/`, { title });

type UseRenameConversationOptions = {
  mutationConfig?: MutationConfig<typeof renameConversation>;
};

export const useRenameConversation = ({
  mutationConfig = {},
}: UseRenameConversationOptions = {}) => {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();

  const { onSuccess, ...restConfig } = mutationConfig;

  return useMutation({
    mutationFn: renameConversation,
    onSuccess: (data, variables, ...args) => {
      queryClient.invalidateQueries({ queryKey: ['ai-conversations'] });
      onSuccess?.(data, variables, ...args);
    },
    onError: () => {
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de renommer la conversation.',
      });
    },
    ...restConfig,
  });
};
