'use client';

import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { Header } from './header';
import { Sidebar } from './sidebar';
import { SidebarProvider, useSidebar } from './sidebar-context';

interface AppShellProps {
  children: ReactNode;
  title: string;
  patientName?: string;
  showCreateExam?: boolean;
  onCreateExam?: () => void;
  showCreatePatient?: boolean;
  onCreatePatient?: () => void;
  rightPanel?: ReactNode;
}

function ShellContent({
  children,
  title,
  patientName,
  showCreateExam = false,
  onCreateExam,
  showCreatePatient = false,
  onCreatePatient,
  rightPanel,
}: AppShellProps) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300',
          isCollapsed ? 'pl-16' : 'pl-60',
        )}
      >
        {/* Header */}
        <Header
          title={title}
          patientName={patientName}
          showCreateExam={showCreateExam}
          onCreateExam={onCreateExam}
          showCreatePatient={showCreatePatient}
          onCreatePatient={onCreatePatient}
        />

        {/* Content with Optional Right Panel */}
        <div className="flex flex-1">
          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">{children}</main>

          {/* Optional Right Panel */}
          {rightPanel}
        </div>
      </div>
    </div>
  );
}

export function Shell(props: AppShellProps) {
  return (
    <SidebarProvider>
      <ShellContent {...props} />
    </SidebarProvider>
  );
}
