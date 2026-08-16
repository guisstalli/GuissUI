// Liste minimale d'utilisateurs pour le sélecteur (pas d'import cross-feature :
// même endpoint que la feature admin, déclaration locale volontairement dupliquée).
import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

type UserOption = { id: number; email: string; role: string };
type PaginatedUserOptions = { count: number; results: UserOption[] };

export const getUserOptionsQueryOptions = () =>
  queryOptions<PaginatedUserOptions>({
    queryKey: ['agent-channel-user-options'],
    queryFn: () =>
      api.get('/users/', { params: { limit: 100, is_active: true } }),
  });

export const useUserOptions = () => useQuery(getUserOptionsQueryOptions());
