import {
  render as rtlRender,
  waitForElementToBeRemoved,
  screen,
  type RenderOptions,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Cookies from 'js-cookie';
import type { ReactElement } from 'react';

import { AppProvider } from '@/app/provider';

import {
  createDiscussion as generateDiscussion,
  createUser as generateUser,
} from './data-generators';
import { db } from './mocks/db';
import { AUTH_COOKIE, authenticate, hash } from './mocks/utils';

type GeneratedUser = ReturnType<typeof generateUser>;
type GeneratedDiscussion = ReturnType<typeof generateDiscussion>;
type UserProperties = Parameters<typeof generateUser>[0];
type DiscussionProperties = Parameters<typeof generateDiscussion>[0];
type AuthenticatedUser = Awaited<ReturnType<typeof authenticate>>;

export const waitForLoadingToFinish = () =>
  waitForElementToBeRemoved(
    () => [
      ...screen.queryAllByTestId(/loading/i),
      ...screen.queryAllByText(/loading/i),
    ],
    { timeout: 4000 },
  );

export const createUser = async (
  userProperties?: UserProperties,
): Promise<GeneratedUser> => {
  const user = generateUser(userProperties);
  await db.user.create({ ...user, password: hash(user.password) });
  return user;
};

export const createDiscussion = async (
  discussionProperties?: DiscussionProperties,
): Promise<GeneratedDiscussion> => {
  const discussion = generateDiscussion(discussionProperties);
  const res = await db.discussion.create(discussion);
  return res as GeneratedDiscussion;
};

export const loginAsUser = async (
  user: GeneratedUser,
): Promise<AuthenticatedUser> => {
  const authUser = await authenticate(user);
  Cookies.set(AUTH_COOKIE, authUser.jwt);
  return authUser;
};

const initializeUser = async (
  user: GeneratedUser | null | undefined,
): Promise<AuthenticatedUser | null> => {
  if (typeof user === 'undefined') {
    const newUser = await createUser();
    return loginAsUser(newUser);
  } else if (user) {
    return loginAsUser(user);
  } else {
    return null;
  }
};

type RenderAppOptions = Omit<RenderOptions, 'wrapper'> & {
  user?: GeneratedUser | null;
};

export const renderApp = async (
  ui: ReactElement,
  { user, ...renderOptions }: RenderAppOptions = {},
) => {
  // if you want to render the app unauthenticated then pass "null" as the user
  const initializedUser = await initializeUser(user);

  const returnValue = {
    ...rtlRender(ui, {
      wrapper: AppProvider,
      ...renderOptions,
    }),
    user: initializedUser,
  };

  return returnValue;
};

export * from '@testing-library/react';
export { userEvent, rtlRender };
