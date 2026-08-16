'use client';

import { type ReactNode } from 'react';

import { useUser } from '@/lib/auth';
import {
  Permission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '@/lib/authorization';
import { useMyCapabilities } from '@/lib/capabilities';
import { PERMISSION_TO_CAPABILITY } from '@/lib/permission-capability-map';

export interface CanProps {
  /** Permission unique à vérifier */
  permission?: Permission;
  /** Liste de permissions à vérifier */
  permissions?: Permission[];
  /** Mode de vérification: 'any' (au moins une) ou 'all' (toutes) */
  mode?: 'any' | 'all';
  /**
   * Capacité serveur arbitrant cet écran, quand elle ne se déduit pas de la
   * permission.
   *
   * `PERMISSION_TO_CAPABILITY` suffit quand la correspondance est de un à un.
   * Elle ne l'est pas toujours : `ai-reports:generate` couvre à la fois
   * l'accès au chat (`ai.chat.access`) et la génération de rapports
   * (`ai.reports.generate`). Mapper la permission trancherait pour l'une au
   * détriment de l'autre ; cette prop laisse l'appelant nommer la bonne.
   *
   * Les entrées de la barre latérale portaient déjà ce couple
   * permission + capability — `Can` ne savait simplement pas le lire, si bien
   * qu'une navigation directe vers l'URL affichait un écran que le menu
   * masquait pourtant.
   */
  capability?: string;
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
  capability,
  mode = 'any',
  children,
  fallback = null,
}: CanProps) {
  const { user } = useUser();
  // `enabled: !!user` : sans ce garde, `Can` interrogeait
  // /users/me/capabilities/ même sur une page PUBLIQUE sans session — la prise
  // de rendez-vous en ligne, notamment. Une requête vouée au 401, sur un écran
  // qui n'a aucun droit à arbitrer.
  const { data: mesCapacites } = useMyCapabilities({ enabled: !!user });

  /**
   * Le serveur arbitre dès qu'une capacité correspond à la permission ; sinon
   * on retombe sur le rôle statique.
   *
   * Sans cela, accorder ou retirer une capacité à UN utilisateur ne changeait
   * rien à ce qu'il voyait : le client décidait seul, à partir du seul rôle.
   *
   * Tant que la requête n'a pas répondu, on s'en tient au rôle statique —
   * c'est l'ancien comportement, et cela évite de faire clignoter l'interface.
   * Le serveur reste de toute façon la seule barrière réelle : ceci ne
   * gouverne que l'affichage.
   */
  const estAutorise = (p: Permission): boolean => {
    const capacite = PERMISSION_TO_CAPABILITY[p];
    if (capacite && mesCapacites) {
      return mesCapacites.capabilities.includes(capacite);
    }
    return hasPermission(user, p);
  };

  // Capacité nommée explicitement : elle prime, car l'appelant en sait plus
  // que la table de correspondance. Tant que la requête n'a pas répondu on
  // retombe sur la permission, pour ne pas faire clignoter l'écran.
  if (capability) {
    if (mesCapacites) {
      return mesCapacites.capabilities.includes(capability) ? (
        <>{children}</>
      ) : (
        <>{fallback}</>
      );
    }
    return permission && hasPermission(user, permission) ? (
      <>{children}</>
    ) : (
      <>{fallback}</>
    );
  }

  // Vérification d'une permission unique
  if (permission) {
    return estAutorise(permission) ? <>{children}</> : <>{fallback}</>;
  }

  // Vérification de plusieurs permissions
  if (permissions && permissions.length > 0) {
    const toutesMappees = permissions.every(
      (p) => p in PERMISSION_TO_CAPABILITY,
    );
    // Un lot MIXTE (permissions mappées et non mappées) ne peut pas être
    // arbitré de façon cohérente : on garde alors le chemin statique entier,
    // plutôt que de mêler deux sources de vérité dans une même décision.
    const isAllowed =
      toutesMappees && mesCapacites
        ? mode === 'all'
          ? permissions.every(estAutorise)
          : permissions.some(estAutorise)
        : mode === 'all'
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
