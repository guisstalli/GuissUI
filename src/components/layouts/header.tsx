'use client';

import { Moon, Plus, Sun, User } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';

interface AppHeaderProps {
  title: string;
  patientName?: string;
  showCreateExam?: boolean;
  onCreateExam?: () => void;
  showCreatePatient?: boolean;
  onCreatePatient?: () => void;
}

export function Header({
  title,
  patientName,
  showCreateExam = false,
  onCreateExam,
  showCreatePatient = false,
  onCreatePatient,
}: AppHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background px-6">
      {/* Left: Title and Context */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        {patientName && (
          <>
            <span className="text-muted-foreground" aria-hidden="true">
              /
            </span>
            <span className="text-base text-muted-foreground">
              {patientName}
            </span>
          </>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Create Patient Button */}
        {showCreatePatient && (
          <Button size="sm" onClick={onCreatePatient}>
            <Plus className="mr-1.5 size-4" aria-hidden="true" />
            Nouveau patient
          </Button>
        )}

        {/* Create Exam Button */}
        {showCreateExam && (
          <Button size="sm" onClick={onCreateExam}>
            <Plus className="mr-1.5 size-4" aria-hidden="true" />
            Nouvel examen
          </Button>
        )}

        {/* Theme Toggle */}
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
                ? 'Switch to light mode'
                : 'Switch to dark mode'
            }
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="size-4" aria-hidden="true" />
            ) : (
              <Moon className="size-4" aria-hidden="true" />
            )}
          </Button>
        )}

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-9"
              aria-label="User menu"
            >
              <User className="size-4" aria-hidden="true" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuSeparator />
            <DropdownMenuSeparator />
            <DropdownMenuItem>Deconnexion</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
