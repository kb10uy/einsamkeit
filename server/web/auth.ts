import { stores } from 'koa-session';
import { EinsamkeitContext, EinsamkeitMiddleware } from '../types';
import { setSuccess, renderPug, getRedis } from '../util';

const redis = getRedis();

export async function showLogin(context: EinsamkeitContext): Promise<void> {
  setSuccess(
    context,
    200,
    renderPug('login.pug', {
      csrfToken: context.csrf,
    }),
  );
}

export async function tryLogin(context: EinsamkeitContext): Promise<void> {}

export async function logout(context: EinsamkeitContext): Promise<void> {}

export const sessionStore: stores = {
  async get(key, maxAge, { rolling }) {
    return redis.get(key);
  },
  async set(key, sess, maxAge, { rolling, changed }) {
    await redis.set(key, sess);
    if (typeof maxAge === 'number') await redis.expire(key, maxAge);
  },
  async destroy(key) {
    await redis.del(key);
  },
};
