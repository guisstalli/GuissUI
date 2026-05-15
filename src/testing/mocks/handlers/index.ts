import { HttpResponse, http } from 'msw';

import { env } from '@/config/env';

import { networkDelay } from '../utils';

import { authHandlers } from './auth';
import { billingHandlers } from './billing';
import { commentsHandlers } from './comments';
import { dashboardHandlers } from './dashboard';
import { discussionsHandlers } from './discussions';
import { notificationsHandlers } from './notifications';
import { teamsHandlers } from './teams';
import { usersHandlers } from './users';

export const handlers = [
  ...authHandlers,
  ...billingHandlers,
  ...commentsHandlers,
  ...dashboardHandlers,
  ...discussionsHandlers,
  ...notificationsHandlers,
  ...teamsHandlers,
  ...usersHandlers,
  http.get(`${env.API_URL}/healthcheck`, async () => {
    await networkDelay();
    return HttpResponse.json({ ok: true });
  }),
];
