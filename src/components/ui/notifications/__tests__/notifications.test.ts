import { renderHook, act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useNotifications, Notification } from '../notifications-store';

test('should add and remove notifications', () => {
  const { result } = renderHook(() => useNotifications());

  expect(result.current.notifications.length).toBe(0);

  const notification: Notification = {
    id: '123',
    title: 'Hello World',
    type: 'info',
    message: 'This is a notification',
  };

  act(() => {
    result.current.addNotification(notification);
  });

  expect(result.current.notifications).toContainEqual(notification);

  act(() => {
    result.current.dismissNotification(notification.id);
  });

  expect(result.current.notifications).not.toContainEqual(notification);
});

describe('fermeture automatique', () => {
  // Staging, 17/09/2026 : les toasts ne se fermaient jamais. Empilés, ils
  // masquaient les boutons « Restaurer » de l'écran qualité.
  beforeEach(() => {
    vi.useFakeTimers();
    useNotifications.setState({ notifications: [] });
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test('un succès se ferme seul après quelques secondes', () => {
    useNotifications
      .getState()
      .addNotification({ type: 'success', title: 'Fait' });

    act(() => {
      vi.advanceTimersByTime(4_900);
    });
    expect(useNotifications.getState().notifications).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(useNotifications.getState().notifications).toHaveLength(0);
  });

  test('une erreur reste plus longtemps, le temps de la lire, puis se ferme', () => {
    useNotifications.getState().addNotification({
      type: 'error',
      title: 'Restauration impossible',
      message: 'Archive introuvable.',
    });

    act(() => {
      vi.advanceTimersByTime(7_900);
    });
    expect(useNotifications.getState().notifications).toHaveLength(1);

    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(useNotifications.getState().notifications).toHaveLength(0);
  });

  test('fermer à la main avant l’échéance ne pose aucun problème', () => {
    useNotifications
      .getState()
      .addNotification({ type: 'info', title: 'Info' });
    const [{ id }] = useNotifications.getState().notifications;

    act(() => {
      useNotifications.getState().dismissNotification(id);
      vi.advanceTimersByTime(10_000);
    });

    expect(useNotifications.getState().notifications).toHaveLength(0);
  });
});
