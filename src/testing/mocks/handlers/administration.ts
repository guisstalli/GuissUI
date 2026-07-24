import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';
import type { AdminDashboard } from '@/features/administration/types/schemas';
import type { MyCapabilities } from '@/lib/capabilities';

// =============================================================================
// MOCK DATA
// =============================================================================

export const mockMyCapabilities: MyCapabilities = {
  capabilities: [
    'ai.chat.access',
    'analytics.admin',
    'security.audit.view',
    'permissions.manage',
    'users.manage',
    'ai.reports.view',
  ],
  is_superuser: false,
};

export const mockMyCapabilitiesSuperuser: MyCapabilities = {
  capabilities: [],
  is_superuser: true,
};

export const mockMyCapabilitiesEmpty: MyCapabilities = {
  capabilities: [],
  is_superuser: false,
};

export const mockCapabilityRegistry = [
  {
    code: 'ai.chat.access',
    label: 'Accès au chat IA',
    category: 'IA',
    description: "Permet d'utiliser le chat avec l'agent IA.",
  },
  {
    code: 'analytics.admin',
    label: 'Analytics administrateur',
    category: 'Analytics',
    description: 'Accès aux tableaux de bord administrateur.',
  },
  {
    code: 'security.audit.view',
    label: 'Journal de sécurité',
    category: 'Sécurité',
    description: 'Lecture du journal de sécurité.',
  },
  {
    code: 'permissions.manage',
    label: 'Gestion des permissions',
    category: 'Administration',
    description: 'Créer et modifier les groupes de permissions.',
  },
];

export const mockPermissionGroups = [
  {
    id: 1,
    name: 'Administrateurs IA',
    description: 'Accès complet aux fonctionnalités IA.',
    is_system: false,
    capabilities: ['ai.chat.access', 'ai.reports.view'],
    user_ids: [1, 2],
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    id: 2,
    name: 'Système interne',
    description: 'Groupe système — non supprimable.',
    is_system: true,
    capabilities: ['security.audit.view'],
    user_ids: [],
    created_at: '2024-01-01T00:00:00Z',
  },
];

export const mockAdminDashboard: AdminDashboard = {
  users: {
    total: 42,
    active: 35,
    inactive: 7,
    verified: 38,
    unverified: 4,
    new_last_30d: 5,
    by_role: { DOCTEUR: 10, STAFF: 20, TECHNICIEN: 12 },
  },
  ai_traffic: {
    total_runs: 1200,
    success: 1150,
    failed: 50,
    tokens_in: 500000,
    tokens_out: 250000,
    cost_usd: 12.5,
    by_capability: { 'ai.chat.access': 800, 'ai.reports.view': 400 },
    runs_per_day: [
      { date: '2024-04-01', runs: 120 },
      { date: '2024-04-02', runs: 95 },
    ],
  },
  security: {
    login_failed_7d: 3,
    access_denied_7d: 1,
    by_event_30d: { LOGIN_FAILED: 10, ACCESS_DENIED: 5 },
  },
  system: {
    patients: 500,
    drivers: 200,
    examens_adultes: 350,
    examens_enfants: 80,
    rapports_ia: 120,
    rendez_vous: 60,
  },
  window_days: 14,
  generated_at: '2024-04-15T08:00:00Z',
};

export const mockSecurityAuditPage1 = {
  count: 45,
  next: `${env.API_URL}/users/security-audit/?limit=20&offset=20`,
  previous: null,
  results: [
    {
      id: 1,
      event: 'LOGIN_FAILED',
      event_display: 'Connexion échouée',
      user_id: 5,
      user_email: 'alice@guiss.sn',
      ip_address: '41.82.0.1',
      metadata: { browser: 'Firefox', attempt: 2 },
      created_at: '2024-04-10T09:15:00Z',
    },
    {
      id: 2,
      event: 'ACCESS_DENIED',
      event_display: 'Accès refusé',
      user_id: null,
      user_email: null,
      ip_address: '192.168.1.10',
      metadata: {},
      created_at: '2024-04-11T14:30:00Z',
    },
  ],
};

export const mockSecurityAuditEmpty = {
  count: 0,
  next: null,
  previous: null,
  results: [],
};

export const mockUserOptions = {
  count: 3,
  next: null,
  previous: null,
  results: [
    { id: 1, email: 'alice@guiss.sn', role: 'DOCTEUR' },
    { id: 2, email: 'bob@guiss.sn', role: 'STAFF' },
    { id: 3, email: 'carol@guiss.sn', role: 'TECHNICIEN' },
  ],
};

// =============================================================================
// HANDLERS
// =============================================================================

export const administrationHandlers = [
  // GET /users/me/capabilities/
  http.get(`${env.API_URL}/users/me/capabilities/`, () =>
    HttpResponse.json(mockMyCapabilities),
  ),

  // GET /users/capabilities/
  http.get(`${env.API_URL}/users/capabilities/`, () =>
    HttpResponse.json(mockCapabilityRegistry),
  ),

  // GET /users/permission-groups/
  http.get(`${env.API_URL}/users/permission-groups/`, () =>
    HttpResponse.json(mockPermissionGroups),
  ),

  // POST /users/permission-groups/
  http.post(
    `${env.API_URL}/users/permission-groups/`,
    async ({ request }) => {
      const body = (await request.json()) as {
        name: string;
        description?: string;
        capability_codes?: string[];
        user_ids?: number[];
      };
      const created = {
        id: 99,
        name: body.name,
        description: body.description ?? '',
        is_system: false,
        capabilities: body.capability_codes ?? [],
        user_ids: body.user_ids ?? [],
        created_at: new Date().toISOString(),
      };
      return HttpResponse.json(created, { status: 201 });
    },
  ),

  // PATCH /users/permission-groups/:id/
  http.patch(
    `${env.API_URL}/users/permission-groups/:id/`,
    async ({ params, request }) => {
      const id = Number(params.id);
      const body = (await request.json()) as {
        name?: string;
        description?: string;
      };
      const existing = mockPermissionGroups.find((g) => g.id === id);
      if (!existing) {
        return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });
      }
      return HttpResponse.json({ ...existing, ...body });
    },
  ),

  // DELETE /users/permission-groups/:id/
  http.delete(`${env.API_URL}/users/permission-groups/:id/`, ({ params }) => {
    const id = Number(params.id);
    const existing = mockPermissionGroups.find((g) => g.id === id);
    if (!existing) {
      return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });
    }
    if (existing.is_system) {
      return HttpResponse.json(
        { detail: 'Cannot delete a system group.' },
        { status: 400 },
      );
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // PUT /users/permission-groups/:id/capabilities/
  http.put(
    `${env.API_URL}/users/permission-groups/:id/capabilities/`,
    async ({ params, request }) => {
      const id = Number(params.id);
      const body = (await request.json()) as { capability_codes: string[] };
      const existing = mockPermissionGroups.find((g) => g.id === id);
      if (!existing) {
        return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });
      }
      return HttpResponse.json({
        ...existing,
        capabilities: body.capability_codes,
      });
    },
  ),

  // PUT /users/permission-groups/:id/users/
  http.put(
    `${env.API_URL}/users/permission-groups/:id/users/`,
    async ({ params, request }) => {
      const id = Number(params.id);
      const body = (await request.json()) as { user_ids: number[] };
      const existing = mockPermissionGroups.find((g) => g.id === id);
      if (!existing) {
        return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });
      }
      return HttpResponse.json({ ...existing, user_ids: body.user_ids });
    },
  ),

  // GET /users/security-audit/
  http.get(`${env.API_URL}/users/security-audit/`, () =>
    HttpResponse.json(mockSecurityAuditPage1),
  ),

  // GET /analytics/admin-dashboard/
  http.get(`${env.API_URL}/analytics/admin-dashboard/`, () =>
    HttpResponse.json(mockAdminDashboard),
  ),

  // GET /users/ (with trailing slash — user options for multi-select)
  http.get(`${env.API_URL}/users/`, () => HttpResponse.json(mockUserOptions)),
];
