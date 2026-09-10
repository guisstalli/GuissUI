import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { networkDelay } from '../utils';

import { agentChannelsHandlers } from './agent-channels';
import { aiInsightsHandlers } from './ai-insights';
import { aiReportsHandlers } from './ai-reports';
import { appointmentsHandlers } from './appointments';
import { authHandlers } from './auth';
import { billingHandlers } from './billing';
import { dashboardHandlers } from './dashboard';
import { notificationsHandlers } from './notifications';
import { usersHandlers } from './users';

export const handlers = [
  ...agentChannelsHandlers,
  // ai-insights AVANT ai-reports : /ai-reports/insights/... doit être capturé
  // avant le handler générique /ai-reports/:id/.
  ...aiInsightsHandlers,
  ...aiReportsHandlers,
  ...appointmentsHandlers,
  ...authHandlers,
  ...billingHandlers,
  ...dashboardHandlers,
  ...notificationsHandlers,
  ...usersHandlers,
  http.get(`${env.API_URL}/healthcheck`, async () => {
    await networkDelay();
    return HttpResponse.json({ ok: true });
  }),
];
