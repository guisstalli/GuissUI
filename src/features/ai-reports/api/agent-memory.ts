import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

type MemoireAgent = { notes: string[] };

/**
 * Ce que l'agent a retenu de l'utilisateur courant.
 *
 * Ces préférences durables (« toujours l'acuité en dixièmes », « se concentrer
 * sur Thiès ») sont réinjectées dans ses prochaines conversations. Sans cet
 * écran, une consigne donnée un jour continuait d'orienter les réponses des
 * semaines plus tard, sans qu'on puisse la retrouver.
 */
export const getAgentMemory = (): Promise<MemoireAgent> =>
  api.get('/ai-reports/memoire/');

export const useAgentMemory = () =>
  useQuery({ queryKey: ['agent-memory'], queryFn: getAgentMemory });

export const useClearAgentMemory = ({
  onSuccess,
}: { onSuccess?: () => void } = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (): Promise<{ effacees: number }> =>
      api.delete('/ai-reports/memoire/'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agent-memory'] });
      onSuccess?.();
    },
  });
};
