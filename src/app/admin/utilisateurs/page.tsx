'use client';

import { ShieldAlert } from 'lucide-react';

import { AppShell as Shell } from '@/app/_shell';
import { Can } from '@/components/ui/can/can';
import { UsersTable } from '@/features/admin/components/users-table';

export default function AdminUsersPage() {
  return (
    <Shell title="Gestion des utilisateurs">
      <Can
        permission="admin:users"
        fallback={
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-muted-foreground">
            <ShieldAlert className="size-12" />
            <p className="text-sm font-medium">Accès non autorisé</p>
            <p className="text-xs">
              Vous n&apos;avez pas les droits pour accéder à cette section.
            </p>
          </div>
        }
      >
        <UsersTable />
      </Can>
    </Shell>
  );
}
