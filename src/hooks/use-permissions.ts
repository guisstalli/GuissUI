'use client';

import { useMemo } from 'react';

import { useUser } from '@/lib/auth';
import {
  Permission,
  getUserPermissions,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canAccessInternalApp,
} from '@/lib/authorization';

/**
 * Hook pour récupérer toutes les permissions de l'utilisateur connecté
 */
export const usePermissions = () => {
  const { user, isLoading, isAuthenticated } = useUser();

  const permissions = useMemo(() => {
    return getUserPermissions(user);
  }, [user]);

  const canAccess = useMemo(() => {
    return canAccessInternalApp(user);
  }, [user]);

  return {
    permissions,
    canAccess,
    isLoading,
    isAuthenticated,
    user,
  };
};

/**
 * Hook pour vérifier si l'utilisateur a une permission spécifique
 * @param permission - La permission à vérifier
 * @returns boolean
 */
export const usePermission = (permission: Permission): boolean => {
  const { user } = useUser();

  return useMemo(() => {
    return hasPermission(user, permission);
  }, [user, permission]);
};

/**
 * Hook pour vérifier si l'utilisateur a au moins une des permissions spécifiées
 * @param permissions - Les permissions à vérifier
 * @returns boolean
 */
export const useAnyPermission = (permissions: Permission[]): boolean => {
  const { user } = useUser();

  return useMemo(() => {
    return hasAnyPermission(user, permissions);
  }, [user, permissions]);
};

/**
 * Hook pour vérifier si l'utilisateur a toutes les permissions spécifiées
 * @param permissions - Les permissions à vérifier
 * @returns boolean
 */
export const useAllPermissions = (permissions: Permission[]): boolean => {
  const { user } = useUser();

  return useMemo(() => {
    return hasAllPermissions(user, permissions);
  }, [user, permissions]);
};

/**
 * Hook pour vérifier si l'utilisateur peut accéder à l'application interne
 * @returns boolean
 */
export const useCanAccessInternalApp = (): boolean => {
  const { user } = useUser();

  return useMemo(() => {
    return canAccessInternalApp(user);
  }, [user]);
};
