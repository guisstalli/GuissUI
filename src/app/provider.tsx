'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { MainErrorFallback } from '@/components/errors/main';
import { Notifications } from '@/components/ui/notifications';
import { TooltipProvider } from '@/components/ui/tooltip/tooltip';
import { NotificationSocketProvider } from '@/features/notifications/hooks/use-notification-socket';
import {
  resetBodyStyles,
  useBodyFrozenWatchdog,
} from '@/hooks/use-dialog-cleanup';
import { InternalAppGuard } from '@/lib/internal-app-guard';
import { queryConfig } from '@/lib/react-query';

type AppProviderProps = {
  children: React.ReactNode;
  /** Vrai quand l'hote est un domaine vitrine (lu au rendu serveur). */
  hoteVitrine?: boolean;
};

export const AppProvider = ({
  children,
  hoteVitrine = false,
}: AppProviderProps) => {
  const pathname = usePathname();
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: queryConfig,
      }),
  );

  // Global safety net: if a Radix modal left `pointer-events: none` (or
  // `overflow: hidden`) stuck on the body, clear it on every navigation so a
  // route change always restores a clickable page. SSR-safe via resetBodyStyles.
  React.useEffect(() => {
    resetBodyStyles();
  }, [pathname]);

  // Filet global : `react-remove-scroll` restaure `pointer-events: none` APRES
  // le demontage d'un dialogue ouvert par-dessus un menu, ce qu'aucun
  // nettoyage declenche au demontage ne peut devancer. On observe donc
  // l'ecriture au lieu de courir contre elle.
  useBodyFrozenWatchdog();

  return (
    <ErrorBoundary FallbackComponent={MainErrorFallback}>
      <SessionProvider>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
              <Notifications />
              <NotificationSocketProvider />
              <InternalAppGuard hoteVitrine={hoteVitrine}>
                {children}
              </InternalAppGuard>
            </TooltipProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
};
