import { z } from 'zod';

export const NotificationSchema = z.object({
  id: z.number(),
  title: z.string(),
  message: z.string(),
  category: z.string(),
  is_read: z.boolean(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.string(),
});

export const PaginatedNotificationsSchema = z.object({
  count: z.number(),
  next: z.string().nullable(),
  previous: z.string().nullable(),
  results: z.array(NotificationSchema),
});

export const UnreadCountSchema = z.object({
  count: z.number(),
});

export type AppNotification = z.infer<typeof NotificationSchema>;
export type PaginatedNotifications = z.infer<
  typeof PaginatedNotificationsSchema
>;
export type UnreadCount = z.infer<typeof UnreadCountSchema>;
