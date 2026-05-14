'use client';

import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Search } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Badge } from '@/components/ui/badge/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/form/input';
import { Spinner } from '@/components/ui/spinner/spinner';
import { TablePagination } from '@/components/ui/table/pagination';
import {
  TableBody,
  TableCell,
  TableElement,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table/table';

import { useUsers } from '../api/get-users';
import type { UserListItem } from '../types/schemas';

import { CreateUserDialog } from './create-user-dialog';
import { UserRowActions } from './user-row-actions';

const ITEMS_PER_PAGE = 20;

function getRoleLabel(role: UserListItem['role']): string {
  switch (role) {
    case 'ADMIN':
      return 'Admin';
    case 'STAFF':
      return 'Staff';
    case 'DOCTEUR':
      return 'Médecin';
    case 'TECHNICIEN':
      return 'Technicien';
  }
}

function RoleBadge({ role }: { role: UserListItem['role'] }) {
  const variants: Record<UserListItem['role'], string> = {
    ADMIN: 'bg-red-100 text-red-700 border-red-200',
    STAFF: 'bg-blue-100 text-blue-700 border-blue-200',
    DOCTEUR: 'bg-green-100 text-green-700 border-green-200',
    TECHNICIEN: 'bg-amber-100 text-amber-700 border-amber-200',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${variants[role]}`}
    >
      {getRoleLabel(role)}
    </span>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <Badge variant="default" className="bg-green-500 hover:bg-green-500/90">
      Actif
    </Badge>
  ) : (
    <Badge variant="destructive">Inactif</Badge>
  );
}

function UserAvatar({ user }: { user: UserListItem }) {
  const initials = user.user_profile
    ? `${user.user_profile.first_name[0] ?? ''}${user.user_profile.last_name[0] ?? ''}`.toUpperCase()
    : user.email[0].toUpperCase();

  const colors: Record<UserListItem['role'], string> = {
    ADMIN: 'bg-red-500',
    STAFF: 'bg-blue-500',
    DOCTEUR: 'bg-green-500',
    TECHNICIEN: 'bg-amber-500',
  };

  if (user.user_profile?.avatar) {
    return (
      <img
        src={user.user_profile.avatar}
        alt={initials}
        className="size-8 rounded-full object-cover"
      />
    );
  }

  return (
    <div
      className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold text-white ${colors[user.role]}`}
    >
      {initials}
    </div>
  );
}

export function UsersTable() {
  const [page, setPage] = useState(1);
  const [emailFilter, setEmailFilter] = useState('');
  const [debouncedEmail, setDebouncedEmail] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [activeFilter, setActiveFilter] = useState('');

  const handleEmailChange = useCallback((value: string) => {
    setEmailFilter(value);
    clearTimeout((handleEmailChange as any)._timer);
    (handleEmailChange as any)._timer = setTimeout(() => {
      setDebouncedEmail(value);
      setPage(1);
    }, 300);
  }, []);

  const offset = (page - 1) * ITEMS_PER_PAGE;
  const params = {
    limit: ITEMS_PER_PAGE,
    offset,
    ...(debouncedEmail && { email: debouncedEmail }),
    ...(roleFilter && { role: roleFilter }),
    ...(activeFilter !== '' && { is_active: activeFilter === 'true' }),
  };

  const { data, isLoading } = useUsers(params);

  const totalPages = data ? Math.ceil(data.count / ITEMS_PER_PAGE) : 1;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-2">
          {/* Email filter */}
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher par email..."
              value={emailFilter}
              onChange={(e) => handleEmailChange(e.target.value)}
              className="pl-8"
            />
          </div>

          {/* Role filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="shadow-xs focus:ring-ring/50 flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus:border-ring focus:ring"
          >
            <option value="">Tous les rôles</option>
            <option value="STAFF">Staff</option>
            <option value="DOCTEUR">Médecin</option>
            <option value="TECHNICIEN">Technicien</option>
            <option value="ADMIN">Admin</option>
          </select>

          {/* Active filter */}
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setPage(1);
            }}
            className="shadow-xs focus:ring-ring/50 flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm outline-none focus:border-ring focus:ring"
          >
            <option value="">Tous les statuts</option>
            <option value="true">Actifs</option>
            <option value="false">Inactifs</option>
          </select>
        </div>

        <CreateUserDialog />
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : !data || data.results.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-2 text-muted-foreground">
            <Search className="size-10" />
            <p className="text-sm">Aucun utilisateur trouvé</p>
            {(debouncedEmail || roleFilter || activeFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEmailFilter('');
                  setDebouncedEmail('');
                  setRoleFilter('');
                  setActiveFilter('');
                  setPage(1);
                }}
              >
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        ) : (
          <>
            <TableElement>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12" />
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Inscrit le</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.results.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <UserAvatar user={user} />
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        {user.user_profile && (
                          <span className="font-medium">
                            {user.user_profile.first_name}{' '}
                            {user.user_profile.last_name}
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {user.email}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge isActive={user.is_active} />
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {user.phone_number || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(user.date_joined), 'dd MMM yyyy', {
                        locale: fr,
                      })}
                    </TableCell>
                    <TableCell>
                      <UserRowActions user={user} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </TableElement>

            {totalPages > 1 && (
              <TablePagination
                totalPages={totalPages}
                currentPage={page}
                onPageChange={setPage}
              />
            )}
          </>
        )}
      </div>

      {data && (
        <p className="text-xs text-muted-foreground">
          {data.count} utilisateur{data.count > 1 ? 's' : ''} au total
        </p>
      )}
    </div>
  );
}
