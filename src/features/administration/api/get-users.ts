// Liste minimale d'utilisateurs pour le sélecteur de membres (pas d'import
// cross-feature : même endpoint que la feature admin, déclaration locale
// volontairement dupliquée, comme dans agent-channels).
import { queryOptions, useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api-client';

export type UserOption = { id: number; email: string; role: string };
type PaginatedUserOptions = { count: number; results: UserOption[] };

export const getUserOptionsQueryOptions = () =>
  queryOptions<PaginatedUserOptions>({
    queryKey: ['administration-user-options'],
    queryFn: () =>
      api.get('/users/', { params: { limit: 200, is_active: true } }),
  });

export const useUserOptions = () => useQuery(getUserOptionsQueryOptions());
