import { describe, expect, test } from 'vitest';

import {
  CAPABILITY,
  hasCapability,
  type MyCapabilities,
} from '../capabilities';

// =============================================================================
// hasCapability — pure unit tests (no MSW, no render)
// =============================================================================

describe('hasCapability', () => {
  const fullCaps: MyCapabilities = {
    capabilities: [CAPABILITY.AI_CHAT_ACCESS, CAPABILITY.ANALYTICS_ADMIN],
    is_superuser: false,
  };

  test('returns false when data is undefined', () => {
    expect(hasCapability(undefined, CAPABILITY.AI_CHAT_ACCESS)).toBe(false);
  });

  test('returns true when the capability is present in the list', () => {
    expect(hasCapability(fullCaps, CAPABILITY.AI_CHAT_ACCESS)).toBe(true);
  });

  test('returns false when the capability is absent from the list', () => {
    expect(hasCapability(fullCaps, CAPABILITY.SECURITY_AUDIT_VIEW)).toBe(false);
  });

  test('returns true for any capability when is_superuser is true, even with empty list', () => {
    const superuser: MyCapabilities = {
      capabilities: [],
      is_superuser: true,
    };
    expect(hasCapability(superuser, CAPABILITY.PERMISSIONS_MANAGE)).toBe(true);
    expect(hasCapability(superuser, CAPABILITY.USERS_MANAGE)).toBe(true);
    expect(hasCapability(superuser, 'some.arbitrary.capability')).toBe(true);
  });

  test('returns false when capabilities list is empty and is_superuser is false', () => {
    const noCaps: MyCapabilities = {
      capabilities: [],
      is_superuser: false,
    };
    expect(hasCapability(noCaps, CAPABILITY.AI_CHAT_ACCESS)).toBe(false);
  });

  test('is case-sensitive — exact string match required', () => {
    const caps: MyCapabilities = {
      capabilities: ['ai.chat.access'],
      is_superuser: false,
    };
    expect(hasCapability(caps, 'AI.CHAT.ACCESS')).toBe(false);
    expect(hasCapability(caps, 'ai.chat.access')).toBe(true);
  });

  test('returns true for each CAPABILITY constant when all are present', () => {
    const allCaps: MyCapabilities = {
      capabilities: Object.values(CAPABILITY),
      is_superuser: false,
    };
    for (const code of Object.values(CAPABILITY)) {
      expect(hasCapability(allCaps, code)).toBe(true);
    }
  });
});
