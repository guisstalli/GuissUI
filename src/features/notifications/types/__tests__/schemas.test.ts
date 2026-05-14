import { describe, expect, test } from 'vitest';

import {
  NotificationSchema,
  PaginatedNotificationsSchema,
  UnreadCountSchema,
} from '../schemas';

const validNotification = {
  id: 1,
  title: 'Nouveau rendez-vous',
  message: 'Un rendez-vous a été planifié pour demain.',
  category: 'appointment',
  is_read: false,
  created_at: '2026-05-11T07:00:00Z',
};

describe('NotificationSchema', () => {
  test('parses a valid notification without optional fields', () => {
    const result = NotificationSchema.safeParse(validNotification);
    expect(result.success).toBe(true);
  });

  test('parses a notification with optional metadata', () => {
    const result = NotificationSchema.safeParse({
      ...validNotification,
      metadata: { appointment_id: 42, extra: 'value' },
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.metadata?.appointment_id).toBe(42);
    }
  });

  test('rejects a notification with missing title', () => {
    const { title: _omit, ...without } = validNotification;
    const result = NotificationSchema.safeParse(without);
    expect(result.success).toBe(false);
  });

  test('rejects a notification with a non-boolean is_read', () => {
    const result = NotificationSchema.safeParse({
      ...validNotification,
      is_read: 'yes',
    });
    expect(result.success).toBe(false);
  });

  test('rejects a notification with a non-numeric id', () => {
    const result = NotificationSchema.safeParse({
      ...validNotification,
      id: 'abc',
    });
    expect(result.success).toBe(false);
  });

  test('parses both read and unread states', () => {
    const unread = NotificationSchema.safeParse({
      ...validNotification,
      is_read: false,
    });
    const read = NotificationSchema.safeParse({
      ...validNotification,
      is_read: true,
    });
    expect(unread.success).toBe(true);
    expect(read.success).toBe(true);
  });
});

describe('PaginatedNotificationsSchema', () => {
  test('parses a valid paginated response', () => {
    const payload = {
      count: 1,
      next: null,
      previous: null,
      results: [validNotification],
    };
    const result = PaginatedNotificationsSchema.safeParse(payload);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.results).toHaveLength(1);
    }
  });

  test('parses a response with pagination links', () => {
    const payload = {
      count: 50,
      next: 'http://api/notifications/?offset=20',
      previous: 'http://api/notifications/?offset=0',
      results: [validNotification],
    };
    const result = PaginatedNotificationsSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  test('rejects a response missing results array', () => {
    const result = PaginatedNotificationsSchema.safeParse({
      count: 1,
      next: null,
      previous: null,
    });
    expect(result.success).toBe(false);
  });

  test('rejects a response with non-number count', () => {
    const result = PaginatedNotificationsSchema.safeParse({
      count: 'many',
      next: null,
      previous: null,
      results: [],
    });
    expect(result.success).toBe(false);
  });
});

describe('UnreadCountSchema', () => {
  test('parses a valid unread count', () => {
    const result = UnreadCountSchema.safeParse({ count: 5 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.count).toBe(5);
    }
  });

  test('parses a zero unread count', () => {
    const result = UnreadCountSchema.safeParse({ count: 0 });
    expect(result.success).toBe(true);
  });

  test('rejects a string count value', () => {
    const result = UnreadCountSchema.safeParse({ count: 'five' });
    expect(result.success).toBe(false);
  });

  test('rejects an empty object', () => {
    const result = UnreadCountSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
