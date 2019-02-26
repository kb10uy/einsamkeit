import * as bcrypt from 'bcrypt';
import { stores } from 'koa-session';
import { EinsamkeitContext, EinsamkeitMiddleware } from '../types';
import { setSuccess, renderPug, getRedis, getKnex } from '../util';

const knex = getKnex();
const redis = getRedis();

export async function checkAuthenticated(context: EinsamkeitContext, next: () => Promise<any>): Promise<void> {}

export async function showLogin(context: EinsamkeitContext): Promise<void> {
  setSuccess(
    context,
    200,
    renderPug('login.pug', {
      csrfToken: context.csrf,
    }),
  );
}

export async function tryLogin(context: EinsamkeitContext): Promise<void> {
  if (!context.session) throw new Error('Precondition failed');

  const { username, password } = context.request.body;
  if (!username || !password) {
    context.redirect('/auth/login');
  }

  const [user] = await knex('users')
    .select()
    .where('name', username);
  if (!user) {
    context.redirect('/auth/login');
  }

  const matchesPassword = await bcrypt.compare(password, user.password_hash);
  if (!matchesPassword) {
    context.redirect('/auth/login');
  }

  context.session.user = user;
}

export async function logout(context: EinsamkeitContext): Promise<void> {
  if (!context.session) throw new Error('Precondition failed');

  context.session.user = undefined;
  context.redirect('/');
}

export const sessionStore: stores = {
  async get(key, maxAge, { rolling }) {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : {};
  },
  async set(key, sess, maxAge, { rolling, changed }) {
    const data = JSON.stringify(sess);
    await redis.set(key, data);
    if (typeof maxAge === 'number') await redis.expire(key, maxAge);
  },
  async destroy(key) {
    await redis.del(key);
  },
};
