'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button/button';
import { Separator } from '@/components/ui/separator/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface AppHeaderProps {
  title: string;
  patientName?: string;
  /** Slot for feature-level actions composed at the app/page level. */
  actions?: ReactNode;
}

export function Header({ title, patientName, actions }: AppHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

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
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            onClick={() =>
              setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
            }
            aria-label={
              resolvedTheme === 'dark'
                ? 'Passer en mode clair'
                : 'Passer en mode sombre'
            }
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="size-4" aria-hidden="true" />
            ) : (
              <Moon className="size-4" aria-hidden="true" />
            )}
          </Button>
        )}
      </div>
    </header>
  );
}
