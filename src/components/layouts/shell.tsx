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
        <div className="flex flex-1">
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
          {rightPanel}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
