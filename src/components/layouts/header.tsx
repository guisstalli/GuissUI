'use client';

import type { ReactNode } from 'react';

import { Separator } from '@/components/ui/separator/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/ui/theme-toggle/theme-toggle';

interface AppHeaderProps {
  title: string;
  patientName?: string;
  /** Slot for feature-level actions composed at the app/page level. */
  actions?: ReactNode;
}

export function Header({ title, patientName, actions }: AppHeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />

      <div className="flex items-center gap-2">
        <h1 className="text-base font-semibold text-foreground">{title}</h1>
        {patientName && (
          <>
            <span className="text-muted-foreground" aria-hidden="true">
              /
            </span>
            <span className="text-sm text-muted-foreground">{patientName}</span>
          </>
        )}
      </div>

      <div className="ml-auto flex items-center gap-2">
        {actions}
        <ThemeToggle className="size-9" />
      </div>
    </header>
  );
}
