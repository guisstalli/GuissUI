import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';
import type {
  AppNotification,
  PaginatedNotifications,
} from '@/features/notifications/types/schemas';

export const mockNotifications: AppNotification[] = [
  {
    id: 1,
    title: 'Nouveau rendez-vous',
    message: 'Un rendez-vous a été planifié pour demain.',
    category: 'appointment',
    is_read: false,
    metadata: { appointment_id: 42 },
    created_at: '2026-05-11T07:00:00Z',
  },
  {
    id: 2,
    title: 'Rappel événement',
    message: 'La campagne de dépistage débute dans 2 jours.',
    category: 'event',
    is_read: false,
    created_at: '2026-05-10T15:00:00Z',
  },
  {
    id: 3,
    title: 'Message lu',
    message: 'Votre rapport a été généré.',
    category: 'report',
    is_read: true,
    created_at: '2026-05-09T12:00:00Z',
  },
];

export const mockPaginatedNotifications: PaginatedNotifications = {
  count: 3,
  next: null,
  previous: null,
  results: mockNotifications,
};

export const notificationsHandlers = [
  http.get(`${env.API_URL}/api/v1/notifications/`, () =>
    HttpResponse.json(mockPaginatedNotifications),
  ),

  http.get(`${env.API_URL}/api/v1/notifications/unread-count/`, () =>
    HttpResponse.json({ count: 2 }),
  ),

  http.post(`${env.API_URL}/api/v1/notifications/:id/read/`, ({ params }) => {
    const id = Number(params.id);
    return HttpResponse.json({ detail: `Notification ${id} marked as read.` });
  }),

  http.post(`${env.API_URL}/api/v1/notifications/read-all/`, () =>
    HttpResponse.json({
      detail: 'All notifications marked as read.',
      count: 2,
    }),
  ),
];
