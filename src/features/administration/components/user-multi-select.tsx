'use client';

import { useMemo, useState } from 'react';

import { Checkbox } from '@/components/ui/checkbox/checkbox';
import { Input } from '@/components/ui/form/input';
import { ScrollArea } from '@/components/ui/scroll-area';

import type { UserOption } from '../api/get-users';

type UserMultiSelectProps = {
  users: UserOption[];
  selected: Set<number>;
  onToggle: (userId: number) => void;
  isLoading?: boolean;
};

/** Sélection multiple d'utilisateurs (membres du groupe), avec recherche. */
export function UserMultiSelect({
  users,
  selected,
  onToggle,
  isLoading = false,
}: UserMultiSelectProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(term) ||
        u.role.toLowerCase().includes(term),
    );
  }, [users, search]);

  return (
    <div className="space-y-2">
      <Input
        placeholder="Rechercher un utilisateur…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ScrollArea className="h-48 rounded-md border border-input">
        <div className="space-y-1 p-2">
          {isLoading ? (
            <p className="p-2 text-sm text-muted-foreground">Chargement…</p>
          ) : filtered.length === 0 ? (
            <p className="p-2 text-sm text-muted-foreground">
              Aucun utilisateur.
            </p>
          ) : (
            filtered.map((user) => (
              <label
                key={user.id}
                className="flex cursor-pointer items-center gap-2 rounded-md px-1.5 py-1 hover:bg-muted"
              >
                <Checkbox
                  checked={selected.has(user.id)}
                  onCheckedChange={() => onToggle(user.id)}
                />
                <span className="flex-1 truncate text-sm text-foreground">
                  {user.email}
                </span>
                <span className="text-xs text-muted-foreground">
                  {user.role}
                </span>
              </label>
            ))
          )}
        </div>
      </ScrollArea>
      <p className="text-xs text-muted-foreground">
        {selected.size} membre{selected.size > 1 ? 's' : ''} sélectionné
        {selected.size > 1 ? 's' : ''}
      </p>
    </div>
  );
}
