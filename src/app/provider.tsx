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
import { resetBodyStyles } from '@/hooks/use-dialog-cleanup';
import { InternalAppGuard } from '@/lib/internal-app-guard';
import { queryConfig } from '@/lib/react-query';

type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
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
              <InternalAppGuard>{children}</InternalAppGuard>
            </TooltipProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
};
