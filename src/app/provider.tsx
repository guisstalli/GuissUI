'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import * as React from 'react';
import { ErrorBoundary } from 'react-error-boundary';

import { MainErrorFallback } from '@/components/errors/main';
import { Notifications } from '@/components/ui/notifications';
import { InternalAppGuard } from '@/lib/internal-app-guard';
import { queryConfig } from '@/lib/react-query';

type AppProviderProps = {
  children: React.ReactNode;
};

export const AppProvider = ({ children }: AppProviderProps) => {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: queryConfig,
      }),
  );

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
            {process.env.DEV && <ReactQueryDevtools />}
            <Notifications />
            <InternalAppGuard>{children}</InternalAppGuard>
          </QueryClientProvider>
        </ThemeProvider>
      </SessionProvider>
    </ErrorBoundary>
  );
};
