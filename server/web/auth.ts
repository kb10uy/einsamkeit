import { stores } from 'koa-session';
import { EinsamkeitContext, EinsamkeitMiddleware } from '../types';

export async function showLogin(context: EinsamkeitContext): Promise<void> {}

export async function tryLogin(context: EinsamkeitContext): Promise<void> {}

export async function logout(context: EinsamkeitContext): Promise<void> {}

export const sessionStore: stores = {
  get(key, maxAge, { rolling }) {},
  set(key, sess, maxAge, { rolling, changed }) {},
  destroy(key) {},
};
