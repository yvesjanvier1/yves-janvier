import { useAuth } from '@/components/dashboard/AuthProvider';
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
  QueryKey,
} from '@tanstack/react-query';

interface AuthenticatedQueryOptions<
  TData = unknown,
  TError = unknown
> extends Omit<UseQueryOptions<TData, TError, TData, QueryKey>, 'queryFn'> {
  queryKey: QueryKey;                      // required
  queryFn: () => Promise<TData>;           // required
  requireAuth?: boolean;                   // optional
  enabled?: boolean;                       // explicitly re-add enabled
}

export function useAuthenticatedQuery<
  TData = unknown,
  TError = unknown
>({
  queryKey,
  queryFn,
  requireAuth = false,
  enabled = true,
  ...options
}: AuthenticatedQueryOptions<TData, TError>): UseQueryResult<TData, TError> {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  return useQuery<TData, TError>({
    queryKey,
    queryFn,
    enabled: requireAuth
      ? isAuthenticated && !authLoading && enabled
      : enabled,
    ...options,
  });
}
