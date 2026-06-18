import { HttpResponse, http } from 'msw';

// ─── Mock data ─────────────────────────────────────────────────────────────────

export const mockAdminUsers = [
  {
    id: 1,
    email: 'alice@guiss.sn',
    phone_number: '+221 77 000 00 01',
    role: 'DOCTEUR' as const,
    is_active: true,
    is_verified: true,
    is_admin: false,
    date_joined: '2024-01-15T10:00:00Z',
    user_profile: {
      first_name: 'Alice',
      last_name: 'Dupont',
      title: 'MRS',
      avatar: null,
    },
  },
  {
    id: 2,
    email: 'bob@guiss.sn',
    phone_number: '+221 77 000 00 02',
    role: 'STAFF' as const,
    is_active: false,
    is_verified: true,
    is_admin: false,
    date_joined: '2024-02-20T10:00:00Z',
    user_profile: {
      first_name: 'Bob',
      last_name: 'Martin',
      title: 'MR',
      avatar: null,
    },
  },
  {
    id: 3,
    email: 'carol@guiss.sn',
    phone_number: '',
    role: 'TECHNICIEN' as const,
    is_active: true,
    is_verified: false,
    is_admin: false,
    date_joined: '2024-03-10T10:00:00Z',
    user_profile: null,
  },
];

export const adminHandlers = [
  // GET /users/ — paginated list with optional email/role/is_active filters
  http.get('http://localhost:8000/users/', ({ request }) => {
    const url = new URL(request.url);
    const emailFilter = url.searchParams.get('email');
    const roleFilter = url.searchParams.get('role');
    const isActiveFilter = url.searchParams.get('is_active');
    const limit = Number(url.searchParams.get('limit') ?? 20);
    const offset = Number(url.searchParams.get('offset') ?? 0);

    let results = [...mockAdminUsers];

    if (emailFilter) {
      results = results.filter((u) =>
        u.email.toLowerCase().includes(emailFilter.toLowerCase()),
      );
    }
    if (roleFilter) {
      results = results.filter((u) => u.role === roleFilter);
    }
    if (isActiveFilter !== null && isActiveFilter !== '') {
      const active = isActiveFilter === 'true';
      results = results.filter((u) => u.is_active === active);
    }

    const paginated = results.slice(offset, offset + limit);

    return HttpResponse.json({
      count: results.length,
      next: null,
      previous: null,
      results: paginated,
    });
  }),

  // GET /users/:id/ — single user detail
  http.get('http://localhost:8000/users/:id/', ({ params }) => {
    const id = Number(params.id);
    const user = mockAdminUsers.find((u) => u.id === id);
    if (!user) {
      return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });
    }
    return HttpResponse.json(user);
  }),

  // POST /users/admin/create/
  http.post('http://localhost:8000/users/admin/create/', async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    const created = {
      id: 99,
      email: body.email as string,
      phone_number: (body.phone_number as string) ?? '',
      role: (body.role as string) ?? 'STAFF',
      is_active: true,
      is_verified: false,
      is_admin: false,
      date_joined: new Date().toISOString(),
      user_profile: {
        first_name: (body.first_name as string) ?? '',
        last_name: (body.last_name as string) ?? '',
        title: (body.title as string) ?? '',
        avatar: null,
      },
    };
    return HttpResponse.json(created, { status: 201 });
  }),

  // DELETE /users/:id/delete/
  http.delete('http://localhost:8000/users/:id/delete/', ({ params }) => {
    const id = Number(params.id);
    const user = mockAdminUsers.find((u) => u.id === id);
    if (!user) {
      return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  // PATCH /users/:id/toggle-active/
  http.patch(
    'http://localhost:8000/users/:id/toggle-active/',
    async ({ params, request }) => {
      const id = Number(params.id);
      const body = (await request.json()) as { is_active: boolean };
      const user = mockAdminUsers.find((u) => u.id === id);
      if (!user) {
        return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });
      }
      return HttpResponse.json({ ...user, is_active: body.is_active });
    },
  ),

  // GET /users/:id/audit-log/
  http.get('http://localhost:8000/users/:id/audit-log/', ({ params }) => {
    const id = Number(params.id);
    if (!mockAdminUsers.find((u) => u.id === id)) {
      return HttpResponse.json({ detail: 'Not found.' }, { status: 404 });
    }
    return HttpResponse.json([
      {
        event: 'USER_LOGIN',
        ip_address: '192.168.1.1',
        metadata: { browser: 'Chrome' },
        created_at: '2024-04-01T09:00:00Z',
      },
      {
        event: 'PASSWORD_CHANGED',
        ip_address: null,
        metadata: {},
        created_at: '2024-04-02T14:30:00Z',
      },
    ]);
  }),
];
