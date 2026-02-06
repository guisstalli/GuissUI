import {
  UseQueryOptions,
  UseMutationOptions,
  DefaultOptions,
} from '@tanstack/react-query';

export const queryConfig = {
  queries: {
    // throwOnError: true,
    refetchOnWindowFocus: false,
    retry: false,
    staleTime: 1000 * 60,
  },
} satisfies DefaultOptions;

export type ApiFnReturnType<FnType extends (...args: any) => Promise<any>> =
  Awaited<ReturnType<FnType>>;

// QueryConfig for use with queryOptions
export type QueryConfig<QueryFnType extends (...args: any) => Promise<any>> =
  Omit<UseQueryOptions<ApiFnReturnType<QueryFnType>>, 'queryKey' | 'queryFn'>;

export type MutationConfig<
  MutationFnType extends (...args: any) => Promise<any>,
> = UseMutationOptions<
  ApiFnReturnType<MutationFnType>,
  Error,
  Parameters<MutationFnType>[0]
>;
