import { describe, it, expect } from 'vitest';

import type { AuthUser } from '../auth';
import {
  ROLES,
  INTERNAL_APP_ROLES,
  hasPermission,
  getUserPermissions,
  canAccessInternalApp,
  isAdmin,
  isDataEntry,
  isSuperuser,
  getRoleLabel,
} from '../authorization';

// =============================================================================
// Helpers
// =============================================================================

function makeUser(role: string): AuthUser {
  return { id: '1', email: 'test@guiss.sn', name: 'Test', role };
}

// =============================================================================
// INTERNAL_APP_ROLES
// =============================================================================

describe('INTERNAL_APP_ROLES', () => {
  it('includes DATA_ENTRY', () => {
    expect(INTERNAL_APP_ROLES).toContain(ROLES.DATA_ENTRY);
  });

  it('includes SUPERUSER', () => {
    expect(INTERNAL_APP_ROLES).toContain(ROLES.SUPERUSER);
  });

  it('does not include ADMIN (admin has a separate portal)', () => {
    expect(INTERNAL_APP_ROLES).not.toContain(ROLES.ADMIN);
  });
});

// =============================================================================
// DATA_ENTRY permissions
// =============================================================================

describe('DATA_ENTRY role permissions', () => {
  const user = makeUser(ROLES.DATA_ENTRY);

  it('has exams:view permission', () => {
    expect(hasPermission(user, 'exams:view')).toBe(true);
  });

  it('has analytics:view permission', () => {
    expect(hasPermission(user, 'analytics:view')).toBe(true);
  });

  it('has exams:technical:edit permission', () => {
    expect(hasPermission(user, 'exams:technical:edit')).toBe(true);
  });

  it('has exams:clinical:edit permission', () => {
    expect(hasPermission(user, 'exams:clinical:edit')).toBe(true);
  });

  it('has antecedents:edit permission', () => {
    expect(hasPermission(user, 'antecedents:edit')).toBe(true);
  });

  it('does NOT have admin:users permission', () => {
    expect(hasPermission(user, 'admin:users')).toBe(false);
  });

  it('does NOT have appointments:cancel permission', () => {
    expect(hasPermission(user, 'appointments:cancel')).toBe(false);
  });

  it('does NOT have sites:create permission', () => {
    expect(hasPermission(user, 'sites:create')).toBe(false);
  });

  it('can access internal app', () => {
    expect(canAccessInternalApp(user)).toBe(true);
  });

  it('isDataEntry returns true', () => {
    expect(isDataEntry(user)).toBe(true);
  });

  it('isAdmin returns false', () => {
    expect(isAdmin(user)).toBe(false);
  });
});

// =============================================================================
// SUPERUSER permissions
// =============================================================================

describe('SUPERUSER role permissions', () => {
  const user = makeUser(ROLES.SUPERUSER);

  it('has all permissions that DATA_ENTRY has', () => {
    const dataEntryPerms = getUserPermissions(makeUser(ROLES.DATA_ENTRY));
    dataEntryPerms.forEach((perm) => {
      expect(hasPermission(user, perm)).toBe(true);
    });
  });

  it('has admin:users permission', () => {
    expect(hasPermission(user, 'admin:users')).toBe(true);
  });

  it('has appointments:cancel permission', () => {
    expect(hasPermission(user, 'appointments:cancel')).toBe(true);
  });

  it('has sites:create permission', () => {
    expect(hasPermission(user, 'sites:create')).toBe(true);
  });

  it('can access internal app', () => {
    expect(canAccessInternalApp(user)).toBe(true);
  });

  it('isSuperuser returns true', () => {
    expect(isSuperuser(user)).toBe(true);
  });
});

// =============================================================================
// Role labels
// =============================================================================

describe('getRoleLabel', () => {
  it('returns correct label for DATA_ENTRY', () => {
    expect(getRoleLabel(ROLES.DATA_ENTRY)).toBe('Saisie de données');
  });

  it('returns correct label for SUPERUSER', () => {
    expect(getRoleLabel(ROLES.SUPERUSER)).toBe('Superutilisateur');
  });
});

// =============================================================================
// Edge cases — null / undefined user
// =============================================================================

describe('authorization helpers with null user', () => {
  it('hasPermission returns false for null user', () => {
    expect(hasPermission(null, 'exams:view')).toBe(false);
  });

  it('isAdmin returns false for null user', () => {
    expect(isAdmin(null)).toBe(false);
  });

  it('isSuperuser returns false for undefined user', () => {
    expect(isSuperuser(undefined)).toBe(false);
  });

  it('canAccessInternalApp returns false for null user', () => {
    expect(canAccessInternalApp(null)).toBe(false);
  });
});
