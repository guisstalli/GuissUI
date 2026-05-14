/* eslint-disable check-file/filename-naming-convention */
'use client';

import { Shell } from '@/components/layouts/shell';
import { NotificationBell } from '@/features/notifications/components/notification-bell';

type AppShellProps = React.ComponentProps<typeof Shell>;

/**
 * App-level wrapper around Shell that injects the NotificationBell.
 * Pages import from here instead of @/components/layouts so that the shared
 * Shell component stays free of feature imports.
 */
export function AppShell(props: AppShellProps) {
  return <Shell {...props} headerActions={<NotificationBell />} />;
}
