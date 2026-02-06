'use client';

import { type ReactNode } from 'react';

import { useUser } from '@/lib/auth';
import {
  Permission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '@/lib/authorization';

export interface CanProps {
  /** Permission unique à vérifier */
  permission?: Permission;
  /** Liste de permissions à vérifier */
  permissions?: Permission[];
  /** Mode de vérification: 'any' (au moins une) ou 'all' (toutes) */
  mode?: 'any' | 'all';
  /** Contenu à afficher si autorisé */
  children: ReactNode;
  /** Contenu alternatif si non autorisé */
  fallback?: ReactNode;
}

/**
 * Composant de contrôle d'accès basé sur les permissions
 *
 * @example
 * // Permission unique
 * <Can permission="exams:clinical:edit">
 *   <Button>Modifier</Button>
 * </Can>
 *
 * @example
 * // Plusieurs permissions (mode 'any' par défaut)
 * <Can permissions={['exams:clinical:edit', 'exams:technical:edit']}>
 *   <Button>Modifier</Button>
 * </Can>
 *
 * @example
 * // Toutes les permissions requises
 * <Can permissions={['patients:view', 'patients:edit']} mode="all">
 *   <Button>Gérer le patient</Button>
 * </Can>
 *
 * @example
 * // Avec fallback
 * <Can permission="reports:export" fallback={<span>Non autorisé</span>}>
 *   <Button>Exporter</Button>
 * </Can>
 */
export function Can({
  permission,
  permissions,
  mode = 'any',
  children,
  fallback = null,
}: CanProps) {
  const { user } = useUser();

  // Vérification d'une permission unique
  if (permission) {
    const isAllowed = hasPermission(user, permission);
    return isAllowed ? <>{children}</> : <>{fallback}</>;
  }

  // Vérification de plusieurs permissions
  if (permissions && permissions.length > 0) {
    const isAllowed =
      mode === 'all'
        ? hasAllPermissions(user, permissions)
        : hasAnyPermission(user, permissions);
    return isAllowed ? <>{children}</> : <>{fallback}</>;
  }

  // Si aucune permission spécifiée, afficher le contenu
  return <>{children}</>;
}

/**
 * Composant inverse de Can - affiche le contenu si NON autorisé
 */
export function Cannot({
  permission,
  permissions,
  mode = 'any',
  children,
  fallback = null,
}: CanProps) {
  const { user } = useUser();

  // Vérification d'une permission unique
  if (permission) {
    const isAllowed = hasPermission(user, permission);
    return !isAllowed ? <>{children}</> : <>{fallback}</>;
  }

  // Vérification de plusieurs permissions
  if (permissions && permissions.length > 0) {
    const isAllowed =
      mode === 'all'
        ? hasAllPermissions(user, permissions)
        : hasAnyPermission(user, permissions);
    return !isAllowed ? <>{children}</> : <>{fallback}</>;
  }

  // Si aucune permission spécifiée, ne rien afficher
  return <>{fallback}</>;
}
