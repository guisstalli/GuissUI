import { describe, expect, test } from 'vitest';
import { z } from 'zod';

import { optionalPhoneSchema } from '../phone';

const schema = z.object({ phone_number: optionalPhoneSchema });

describe('optionalPhoneSchema', () => {
  test('accepts an empty string and normalizes it to undefined', () => {
    const result = schema.safeParse({ phone_number: '' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone_number).toBeUndefined();
  });

  test('accepts a whitespace-only string as empty (undefined)', () => {
    const result = schema.safeParse({ phone_number: '   ' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone_number).toBeUndefined();
  });

  test('accepts null and undefined → undefined', () => {
    const fromNull = schema.safeParse({ phone_number: null });
    const fromUndefined = schema.safeParse({ phone_number: undefined });
    expect(fromNull.success).toBe(true);
    expect(fromUndefined.success).toBe(true);
    if (fromNull.success) expect(fromNull.data.phone_number).toBeUndefined();
  });

  test('accepts a valid E.164 number', () => {
    const result = schema.safeParse({ phone_number: '+221771234567' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone_number).toBe('+221771234567');
  });

  test('trims surrounding whitespace before validating', () => {
    const result = schema.safeParse({ phone_number: '  +221771234567  ' });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone_number).toBe('+221771234567');
  });

  test('rejects a clearly invalid number', () => {
    expect(schema.safeParse({ phone_number: '123' }).success).toBe(false);
  });

  test('rejects a non-E.164 (missing country code) number', () => {
    expect(schema.safeParse({ phone_number: '771234567' }).success).toBe(false);
  });
});
