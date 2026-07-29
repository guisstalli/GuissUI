'use client';

import type { ReactNode } from 'react';

import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';

import { Header } from './header';
import { AppSidebar } from './sidebar';

interface AppShellProps {
  children: ReactNode;
  title: string;
  patientName?: string;
  rightPanel?: ReactNode;
  /** Slot for feature-level header actions. Composed at the app/page level. */
  headerActions?: ReactNode;
}

export function Shell({
  children,
  title,
  patientName,
  rightPanel,
  headerActions,
}: AppShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header
          title={title}
          patientName={patientName}
          actions={headerActions}
        />
        <div className="flex min-h-0 flex-1">
          {/* `overflow-auto` et non `overflow-y-auto` : un contenu trop large
              (tableau, graphe) doit defiler DANS cette zone. Avec un
              debordement uniquement vertical, l'excedent horizontal remontait
              jusqu'au <body> et la barre traversait toute la fenetre. */}
          <main className="min-w-0 flex-1 overflow-auto p-6">{children}</main>
          {rightPanel}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
