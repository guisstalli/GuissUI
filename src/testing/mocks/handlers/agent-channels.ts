import { http, HttpResponse } from 'msw';

import { env } from '@/config/env';

import { networkDelay } from '../utils';

export const mockAllowedSender = {
  id: 1,
  channel: 'whatsapp',
  identifier: '+221770000001',
  user_id: 7,
  user_email: 'superuser@guiss.sn',
  can_chat: true,
  can_trigger_actions: false,
  conversation_id: null,
  approved_by_email: 'superuser@guiss.sn',
  created_at: '2026-07-22T10:00:00Z',
};

export const mockChannelMessage = {
  id: 11,
  direction: 'in',
  channel: 'whatsapp',
  peer: '+221770000001',
  body: 'Combien de patients ce mois-ci ?',
  status: 'processed',
  error_message: '',
  created_at: '2026-07-22T10:05:00Z',
};

export const agentChannelsHandlers = [
  http.get(`${env.API_URL}/agent-channels/senders/`, async () => {
    await networkDelay();
    return HttpResponse.json([mockAllowedSender]);
  }),

  http.post(`${env.API_URL}/agent-channels/senders/`, async () => {
    await networkDelay();
    return HttpResponse.json(
      { ...mockAllowedSender, id: 2, identifier: '+221770000002' },
      { status: 201 },
    );
  }),

  http.patch(`${env.API_URL}/agent-channels/senders/:id/`, async () => {
    await networkDelay();
    return HttpResponse.json({ ...mockAllowedSender, can_chat: false });
  }),

  http.delete(`${env.API_URL}/agent-channels/senders/:id/`, async () => {
    await networkDelay();
    return new HttpResponse(null, { status: 204 });
  }),

  http.get(`${env.API_URL}/agent-channels/messages/`, async () => {
    await networkDelay();
    return HttpResponse.json([mockChannelMessage]);
  }),
];
