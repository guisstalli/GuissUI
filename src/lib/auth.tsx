import { useCallback } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

export { useSession, signIn, signOut };

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export const useUser = () => {
  const { data: session, status } = useSession();

  const user: AuthUser | undefined = session?.user
    ? {
        id: session.user.id,
        email: session.user.email ?? '',
        name: session.user.name ?? '',
        role: session.user.role,
      }
    : undefined;

  return {
    user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    error: session?.error,
  };
};

export const useLogin = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const login = useCallback(
    async (email: string, password: string) => {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });
      if (result?.ok && !result.error && onSuccess) {
        onSuccess();
      }
      return result;
    },
    [onSuccess],
  );

  return { login };
};

export const useLogout = ({ onSuccess }: { onSuccess?: () => void } = {}) => {
  const logout = useCallback(async () => {
    await signOut({ redirect: false });
    onSuccess?.();
  }, [onSuccess]);

  return {
    logout,
    logoutWithRedirect: () => signOut({ callbackUrl: '/auth/login' }),
  };
};

export const useHasRole = (role: string): boolean => {
  const { user } = useUser();
  return user?.role === role;
};

export const useHasAnyRole = (roles: string[]): boolean => {
  const { user } = useUser();
  return roles.some((r) => user?.role === r);
};
