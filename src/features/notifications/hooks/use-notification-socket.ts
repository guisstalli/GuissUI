'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';

import { useNotifications as useToastStore } from '@/components/ui/notifications';
import { env } from '@/config/env';

import type { AppNotification } from '../types/schemas';

const RECONNECT_MIN_MS = 1_000;
const RECONNECT_MAX_MS = 30_000;

/**
 * Convert HTTP API URL (e.g. http://localhost:8000/api) into a WebSocket
 * base (e.g. ws://localhost:8000). The `/api` suffix is stripped so the
 * resulting URL matches `apps/notifications/routing.py` which mounts at
 * `ws/notifications/` on the project root.
 */
function deriveWebSocketBase(apiUrl: string): string | null {
  try {
    const url = new URL(apiUrl);
    const wsProtocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${wsProtocol}//${url.host}`;
  } catch {
    return null;
  }
}

function playPing() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtxClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtxClass) return;
    const ctx = new AudioCtxClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
    osc.onended = () => ctx.close().catch(() => undefined);
  } catch {
    // Audio is best-effort; ignore failures (autoplay policy, etc.)
  }
}

function showBrowserNotification(notif: AppNotification) {
  if (typeof window === 'undefined') return;
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    const browserNotif = new Notification(notif.title, {
      body: notif.message,
      icon: '/logo192.png',
      tag: `guiss-notif-${notif.id}`,
      requireInteraction: false,
    });
    browserNotif.onclick = () => {
      window.focus();
      browserNotif.close();
    };
  } catch {
    // Some browsers throw on `new Notification` from non-user contexts.
  }
}

/**
 * Opens a single WebSocket connection to the Django Channels notifications
 * consumer for the authenticated user. On message:
 *   - invalidates the notifications + unread-count queries (badge & list)
 *   - shows an in-app toast
 *   - shows a browser notification (if permission granted)
 *   - plays a short audible ping
 *
 * Auto-reconnects with capped exponential backoff on unexpected close.
 */
export function useNotificationSocket() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const attemptRef = useRef(0);

  const accessToken =
    status === 'authenticated' ? (session?.accessToken ?? null) : null;

  useEffect(() => {
    if (!accessToken) return;
    if (typeof window === 'undefined') return;

    const wsBase = deriveWebSocketBase(env.API_URL);
    if (!wsBase) return;

    let isCancelled = false;

    const connect = () => {
      if (isCancelled) return;

      const url = `${wsBase}/ws/notifications/?token=${encodeURIComponent(accessToken)}`;
      const socket = new WebSocket(url);
      socketRef.current = socket;

      socket.onopen = () => {
        attemptRef.current = 0;
      };

      socket.onmessage = (event) => {
        let payload: AppNotification | null = null;
        try {
          payload = JSON.parse(event.data) as AppNotification;
        } catch {
          return;
        }
        if (!payload) return;

        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({
          queryKey: ['notifications', 'unread-count'],
        });

        useToastStore.getState().addNotification({
          type: 'info',
          title: payload.title,
          message: payload.message,
        });

        showBrowserNotification(payload);
        playPing();
      };

      socket.onclose = (event) => {
        socketRef.current = null;
        // Auth failure: don't reconnect (token will be refreshed elsewhere).
        if (event.code === 4001 || isCancelled) return;

        const delay = Math.min(
          RECONNECT_MAX_MS,
          RECONNECT_MIN_MS * 2 ** attemptRef.current,
        );
        attemptRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(connect, delay);
      };

      socket.onerror = () => {
        // onclose will fire next — let it handle reconnection.
      };
    };

    connect();

    return () => {
      isCancelled = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (socketRef.current) {
        socketRef.current.close(1000);
        socketRef.current = null;
      }
      attemptRef.current = 0;
    };
  }, [accessToken, queryClient]);
}

export function NotificationSocketProvider() {
  useNotificationSocket();
  return null;
}
