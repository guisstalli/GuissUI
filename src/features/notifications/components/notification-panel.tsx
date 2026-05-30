'use client';

import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Bell, CheckCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Badge } from '@/components/ui/badge/badge';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

import { useNotifications } from '../api/get-notifications';
import { useMarkAllRead } from '../api/mark-all-read';
import { useMarkRead } from '../api/mark-read';
import type { AppNotification } from '../types/schemas';

function timeAgo(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), {
      addSuffix: true,
      locale: fr,
    });
  } catch {
    return '';
  }
}

function NotificationItem({ notification }: { notification: AppNotification }) {
  const { mutate: markRead, isPending } = useMarkRead();

  return (
    <button
      type="button"
      onClick={() => {
        if (!notification.is_read) {
          markRead(notification.id);
        }
      }}
      className={`hover:bg-accent/60 w-full cursor-pointer rounded-md px-3 py-2.5 text-left transition-colors ${
        notification.is_read ? 'opacity-60' : 'bg-primary/5 dark:bg-primary/10'
      } ${isPending ? 'pointer-events-none opacity-50' : ''}`}
    >
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="shrink-0 text-xs">
              {notification.category}
            </Badge>
            {!notification.is_read && (
              <span className="size-2 shrink-0 rounded-full bg-primary" />
            )}
          </div>
          <p className="mt-1 line-clamp-1 text-sm font-medium leading-tight">
            {notification.title}
          </p>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
            {notification.message}
          </p>
          <p className="text-muted-foreground/70 mt-1 text-xs">
            {timeAgo(notification.created_at)}
          </p>
        </div>
      </div>
    </button>
  );
}

function NotificationPermissionPrompt() {
  const [permission, setPermission] = useState<NotificationPermission | null>(
    null,
  );

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    setPermission(Notification.permission);
  }, []);

  if (permission !== 'default') return null;

  const request = async () => {
    const result = await Notification.requestPermission();
    setPermission(result);
  };

  return (
    <button
      type="button"
      onClick={request}
      className="flex w-full items-center gap-2 border-b bg-amber-50 px-4 py-2 text-left text-xs text-amber-800 transition-colors hover:bg-amber-100 dark:bg-amber-400/[0.06] dark:text-amber-300 dark:hover:bg-amber-400/[0.10]"
    >
      <Bell className="size-3.5 shrink-0" />
      <span className="flex-1">Activer les notifications du navigateur</span>
      <span className="font-semibold">Autoriser →</span>
    </button>
  );
}

export function NotificationPanel() {
  const { data, isLoading } = useNotifications({
    params: { limit: 10 },
  });
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllRead();

  const notifications = data?.results ?? [];
  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <div className="flex w-80 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h3 className="text-sm font-semibold">Notifications</h3>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto gap-1.5 px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => markAllRead()}
            disabled={isMarkingAll}
          >
            {isMarkingAll ? (
              <Spinner size="sm" />
            ) : (
              <CheckCheck className="size-3.5" />
            )}
            Marquer tout comme lu
          </Button>
        )}
      </div>
      <NotificationPermissionPrompt />

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner size="sm" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-sm text-muted-foreground">Aucune notification</p>
          </div>
        ) : (
          <div className="divide-border/50 divide-y p-1">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
