
import { useAuth } from '@/components/dashboard/AuthProvider';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

interface AuthenticatedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryFn'> {
  queryFn: () => Promise<T>;
  requireAuth?: boolean;
}

export function useAuthenticatedQuery<T>({
  queryKey,
  queryFn,
  requireAuth = false,
  ...options
}: AuthenticatedQueryOptions<T>) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  return useQuery({
    queryKey,
    queryFn,
    enabled: requireAuth ? isAuthenticated && !authLoading : (options.enabled ?? true),
    ...options,
  });
}
