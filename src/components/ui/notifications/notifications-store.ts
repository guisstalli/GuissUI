import { nanoid } from 'nanoid';
import { create } from 'zustand';

export type Notification = {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message?: string;
};

type NotificationsStore = {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  dismissNotification: (id: string) => void;
};

/**
 * Durée d'affichage avant fermeture automatique. Sans elle, les toasts
 * s'empilaient sans fin et masquaient les boutons de la page (staging,
 * 17/09/2026). Une erreur reste plus longtemps : elle se lit, elle ne se
 * survole pas.
 */
export const DUREE_AFFICHAGE_MS: Record<Notification['type'], number> = {
  success: 5_000,
  info: 5_000,
  warning: 8_000,
  error: 8_000,
};

export const useNotifications = create<NotificationsStore>((set, get) => ({
  notifications: [],
  addNotification: (notification) => {
    const complete = { id: nanoid(), ...notification };
    set((state) => ({
      notifications: [...state.notifications, complete],
    }));
    setTimeout(
      () => get().dismissNotification(complete.id),
      DUREE_AFFICHAGE_MS[complete.type],
    );
  },
  dismissNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter(
        (notification) => notification.id !== id,
      ),
    })),
}));
