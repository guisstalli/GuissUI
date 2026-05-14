'use client';

import { CheckCircle2, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge/badge';
import { getRoleLabel, type Role } from '@/lib/authorization';
import { cn } from '@/lib/utils';

import type { User } from '../types/schemas';

interface ProfileHeaderProps {
  user: User;
}

const roleColors: Record<string, string> = {
  ADMIN: 'bg-red-500',
  STAFF: 'bg-blue-500',
  DOCTEUR: 'bg-green-500',
  TECHNICIEN: 'bg-amber-500',
};

function getInitials(user: User): string {
  const first = user.profile?.first_name?.[0] ?? '';
  const last = user.profile?.last_name?.[0] ?? '';
  if (first || last) return (first + last).toUpperCase();
  return user.email.slice(0, 2).toUpperCase();
}

function getDisplayName(user: User): string {
  const { profile } = user;
  if (profile?.first_name || profile?.last_name) {
    return [profile.first_name, profile.last_name].filter(Boolean).join(' ');
  }
  return user.email;
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  const initials = getInitials(user);
  const displayName = getDisplayName(user);
  const avatarBg = roleColors[user.role] ?? 'bg-muted';
  const roleLabel = getRoleLabel(user.role as Role);

  return (
    <div className="flex items-center gap-6 rounded-xl border bg-card p-6">
      {/* Avatar */}
      <div className="relative">
        {user.profile?.avatar ? (
          <img
            src={user.profile.avatar}
            alt={displayName}
            className="size-20 rounded-full object-cover"
          />
        ) : (
          <div
            className={cn(
              'flex size-20 items-center justify-center rounded-full text-2xl font-bold text-white',
              avatarBg,
            )}
            aria-hidden="true"
          >
            {initials}
          </div>
        )}
        {user.is_verified && (
          <CheckCircle2
            className="absolute -bottom-1 -right-1 size-5 text-green-500"
            aria-label="Compte vérifié"
          />
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-foreground">{displayName}</h2>
        <p className="text-sm text-muted-foreground">{user.email}</p>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{roleLabel}</Badge>
          {user.is_verified && (
            <Badge
              variant="outline"
              className="gap-1 border-green-200 text-green-600"
            >
              <CheckCircle2 className="size-3" aria-hidden="true" />
              Vérifié
            </Badge>
          )}
          {user.is_admin && (
            <Badge
              variant="outline"
              className="gap-1 border-red-200 text-red-600"
            >
              <ShieldCheck className="size-3" aria-hidden="true" />
              Admin
            </Badge>
          )}
          {!user.is_active && <Badge variant="destructive">Inactif</Badge>}
        </div>
      </div>
    </div>
  );
}
