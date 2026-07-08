import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { networkDelay } from '../utils';

export const mockCapabilities = [
  {
    key: 'ai_reports',
    display_name: 'Rapports analytiques IA',
    risk_tier: 'aggregate',
    healthy: true,
  },
];

export const mockAskResponse = {
  answer_markdown:
    '## Résultat\n\nSur la période analysée, **55 examens** ont été réalisés.',
  sources: { get_overview: { population: { examens_total: 55 } } },
  sources_display: [
    {
      tool: 'get_overview',
      label: "Vue d'ensemble de la cohorte",
      filters: [
        { label: 'Période', value: 'du 01/01/2026 au 30/06/2026' },
        { label: 'Sexe', value: 'Femmes' },
      ],
      cell_count: 55,
    },
  ],
  verification: { passed: true, ungrounded: [], violations: [] },
  tools_used: ['get_overview'],
  conversation_id: 42,
  // Id d'un NOUVEAU tour : jamais en collision avec les messages déjà
  // persistés de mockConversationMessages (1 et 2).
  message_id: 7,
};

export const mockConversationListItem = {
  id: 42,
  title: 'Combien de patients ce mois-ci ?',
  created_at: '2026-07-06T10:00:00Z',
  updated_at: '2026-07-06T10:05:00Z',
  message_count: 2,
};

export const mockConversationMessages = [
  {
    id: 1,
    role: 'USER',
    content: 'Combien de patients ce mois-ci ?',
    status: 'SUCCESS',
    error_message: '',
    sources: null,
    sources_display: null,
    verification: null,
    tools_used: [],
    created_at: '2026-07-06T10:00:00Z',
  },
  {
    id: 2,
    role: 'ASSISTANT',
    content: 'Sur la période analysée, **55 examens** ont été réalisés.',
    status: 'SUCCESS',
    error_message: '',
    sources: mockAskResponse.sources,
    sources_display: mockAskResponse.sources_display,
    verification: mockAskResponse.verification,
    tools_used: mockAskResponse.tools_used,
    created_at: '2026-07-06T10:05:00Z',
  },
];

export const mockConversationDetail = {
  id: 42,
  title: 'Combien de patients ce mois-ci ?',
  created_at: '2026-07-06T10:00:00Z',
  updated_at: '2026-07-06T10:05:00Z',
  messages: mockConversationMessages,
};

export const mockReportListItem = {
  id: 1,
  status: 'DRAFT',
  report_type: 'rapport_periodique',
  requester_email: 'docteur1@guiss.sn',
  verification_passed: true,
  cost_usd: '0.0423',
  created_at: '2026-07-06T10:00:00Z',
};

export const mockReportDetail = {
  ...mockReportListItem,
  risk_tier: 'aggregate',
  filters: {},
  prompt: '',
  pdf_url: null,
  docx_url: 'https://s3.example.test/ai_reports/report_1.docx',
  llm_backend: 'gemini',
  model_used: 'gemini-2.0-flash',
  tokens_in: 4200,
  tokens_out: 1800,
  verification_report: { passed: true, checks: [] },
  approved_by_email: null,
  approved_at: null,
  rejection_reason: '',
  delivered_at: null,
  error_message: '',
  updated_at: '2026-07-06T10:05:00Z',
};

export const aiReportsHandlers = [
  http.get(`${env.API_URL}/ai/capabilities/`, async () => {
    await networkDelay();
    return HttpResponse.json(mockCapabilities);
  }),

  http.post(`${env.API_URL}/ai-reports/ask/`, async () => {
    await networkDelay();
    return HttpResponse.json(mockAskResponse);
  }),

  http.post(`${env.API_URL}/ai-reports/generate/`, async () => {
    await networkDelay();
    return HttpResponse.json({ report_id: 99 }, { status: 202 });
  }),

  http.get(`${env.API_URL}/ai-reports/`, async () => {
    await networkDelay();
    return HttpResponse.json({
      count: 1,
      next: null,
      previous: null,
      results: [mockReportListItem],
    });
  }),

  // Déclarés AVANT /ai-reports/:id/ : sinon :id capturerait « conversations ».
  http.get(`${env.API_URL}/ai-reports/conversations/`, async () => {
    await networkDelay();
    return HttpResponse.json({
      count: 1,
      next: null,
      previous: null,
      results: [mockConversationListItem],
    });
  }),

  http.get(
    `${env.API_URL}/ai-reports/conversations/:id/`,
    async ({ params }) => {
      await networkDelay();
      if (String(params.id) === '42') {
        return HttpResponse.json(mockConversationDetail);
      }
      return HttpResponse.json(
        { message: `Conversation ${params.id} introuvable.` },
        { status: 404 },
      );
    },
  ),

  http.patch(
    `${env.API_URL}/ai-reports/conversations/:id/`,
    async ({ params, request }) => {
      await networkDelay();
      const body = (await request.json()) as { title?: string };
      return HttpResponse.json({
        id: Number(params.id),
        title: body.title ?? mockConversationListItem.title,
        created_at: mockConversationListItem.created_at,
        updated_at: '2026-07-06T11:00:00Z',
      });
    },
  ),

  http.delete(`${env.API_URL}/ai-reports/conversations/:id/`, async () => {
    await networkDelay();
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${env.API_URL}/ai-reports/:id/`, async ({ params }) => {
    await networkDelay();
    if (String(params.id) === '1') {
      return HttpResponse.json(mockReportDetail);
    }
    return HttpResponse.json(
      { message: 'Rapport introuvable.' },
      { status: 404 },
    );
  }),

  http.post(`${env.API_URL}/ai-reports/:id/approve/`, async ({ params }) => {
    await networkDelay();
    return HttpResponse.json({
      ...mockReportDetail,
      id: Number(params.id),
      status: 'APPROVED',
      approved_by_email: 'docteur1@guiss.sn',
      approved_at: '2026-07-06T11:00:00Z',
    });
  }),

  http.post(`${env.API_URL}/ai-reports/:id/reject/`, async ({ params }) => {
    await networkDelay();
    return HttpResponse.json({
      ...mockReportDetail,
      id: Number(params.id),
      status: 'REJECTED',
      rejection_reason: 'Motif de test',
    });
  }),

  http.post(`${env.API_URL}/ai-reports/:id/deliver/`, async ({ params }) => {
    await networkDelay();
    return HttpResponse.json({
      ...mockReportDetail,
      id: Number(params.id),
      status: 'DELIVERED',
      delivered_at: '2026-07-06T12:00:00Z',
    });
  }),
];
