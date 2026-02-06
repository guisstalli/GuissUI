import { useSession, signIn, signOut } from 'next-auth/react';
import { useCallback } from 'react';

// Re-export session hooks from next-auth
export { useSession, signIn, signOut };

// User type from Keycloak session
export interface AuthUser {
  id: string;
  email: string;
  name: string;
  roles: string[];
}

/**
 * Hook to get the current authenticated user
 */
export const useUser = () => {
  const { data: session, status } = useSession();

  return {
    user: session?.user as AuthUser | undefined,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    error: session?.error,
  };
};

/**
 * Hook to handle login with Keycloak
 */
export const useLogin = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const login = useCallback(async () => {
    const result = await signIn('keycloak', { redirect: false });
    if (result?.ok && onSuccess) {
      onSuccess();
    }
    return result;
  }, [onSuccess]);

  return {
    login,
    loginWithRedirect: () => signIn('keycloak'),
  };
};

/**
 * Hook to handle logout from Keycloak
 */
export const useLogout = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    onSuccess?.();
  }, [onSuccess]);

  return {
    logout,
    logoutWithRedirect: () => signOut({ callbackUrl: '/api/auth/signin' }),
  };
};

/**
 * Check if user has a specific role
 */
export const useHasRole = (role: string): boolean => {
  const { user } = useUser();
  return user?.roles?.includes(role) ?? false;
};

/**
 * Check if user has any of the specified roles
 */
export const useHasAnyRole = (roles: string[]): boolean => {
  const { user } = useUser();
  return roles.some((role) => user?.roles?.includes(role)) ?? false;
};

/**
 * Check if user has all of the specified roles
 */
export const useHasAllRoles = (roles: string[]): boolean => {
  const { user } = useUser();
  return roles.every((role) => user?.roles?.includes(role)) ?? false;
};
