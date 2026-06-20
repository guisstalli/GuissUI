import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';
import type { Site, SiteListResponse } from '@/features/sites/types';

export const mockSites: Site[] = [
  {
    id: 1,
    libelle: 'Dakar - Plateau',
    code: 'dakar-plateau',
    adresse: '12 Rue des Médecins, Dakar',
    is_active: true,
    created: '2024-01-01T00:00:00Z',
    modified: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    libelle: 'Thiès Centre',
    code: 'thies-centre',
    adresse: null,
    is_active: true,
    created: '2024-01-02T00:00:00Z',
    modified: '2024-01-02T00:00:00Z',
  },
  {
    id: 3,
    libelle: 'Ziguinchor',
    code: 'ziguinchor',
    adresse: 'Avenue de la Paix, Ziguinchor',
    is_active: false,
    created: '2024-01-03T00:00:00Z',
    modified: '2024-01-03T00:00:00Z',
  },
];

const mockSiteListResponse: SiteListResponse = {
  count: mockSites.length,
  next: null,
  previous: null,
  results: mockSites,
};

export const sitesHandlers = [
  http.get(`${env.API_URL}/depistage/sites/`, ({ request }) => {
    const url = new URL(request.url);
    const search = url.searchParams.get('search');

    if (search) {
      const filtered = mockSites.filter((site) =>
        site.libelle.toLowerCase().includes(search.toLowerCase()),
      );
      return HttpResponse.json({
        count: filtered.length,
        next: null,
        previous: null,
        results: filtered,
      });
    }

    return HttpResponse.json(mockSiteListResponse);
  }),

  http.post(`${env.API_URL}/depistage/sites/`, async ({ request }) => {
    const body = (await request.json()) as Omit<Site, 'id'>;
    const created: Site = {
      ...body,
      id: 99,
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
    };
    return HttpResponse.json(created, { status: 201 });
  }),

  http.put(
    `${env.API_URL}/depistage/sites/:id/`,
    async ({ params, request }) => {
      const id = Number(params.id);
      const body = (await request.json()) as Partial<Site>;
      const site = mockSites.find((s) => s.id === id);
      if (!site) return new HttpResponse(null, { status: 404 });
      return HttpResponse.json({ ...site, ...body });
    },
  ),

  http.delete(`${env.API_URL}/depistage/sites/:id/`, ({ params }) => {
    const id = Number(params.id);
    const site = mockSites.find((s) => s.id === id);
    if (!site) return new HttpResponse(null, { status: 404 });
    return new HttpResponse(null, { status: 204 });
  }),
];
