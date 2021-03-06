import * as bcrypt from 'bcrypt';
import { stores } from 'koa-session';
import { EinsamkeitContext } from '../types';
import { setSuccess, renderPug, getRedis, getKnex, addErrorFlash, addInformationFlash, keepFlash } from '../util';

const knex = getKnex();
const redis = getRedis();

export async function checkAuthenticated(context: EinsamkeitContext, next: () => Promise<any>): Promise<void> {
  if (!context || !context.session) throw new Error('Precondition failed');
  if (!context.session.user) {
    addErrorFlash(context, 'ログインしろボケナス');
    keepFlash(context);
    context.redirect('/auth/login');
    return;
  }
  await next();
}

export async function showLogin(context: EinsamkeitContext): Promise<void> {
  if (!context.session) throw new Error('Precondition failed');
  setSuccess(
    context,
    200,
    renderPug('login.pug', {
      csrfToken: context.csrf,
      flash: context.session.flash,
    }),
  );
}

export async function tryLogin(context: EinsamkeitContext): Promise<void> {
  if (!context.session) throw new Error('Precondition failed');

  const { username, password } = context.request.body;
  if (!username || !password) {
    addErrorFlash(context, '節穴アイか? input 要素ぐらいちゃんと見ろボケ');
    keepFlash(context);
    context.redirect('/auth/login');
    return;
  }

  const [user] = await knex('users')
    .select()
    .where('name', username);
  if (!user) {
    addErrorFlash(context, 'さてはアンチだなオメー');
    keepFlash(context);
    context.redirect('back');
    return;
  }

  const matchesPassword = await bcrypt.compare(password, user.password_hash);
  if (!matchesPassword) {
    addErrorFlash(context, 'お?パスワード忘れたか?');
    keepFlash(context);
    context.redirect('/auth/login');
    return;
  }

  context.session.user = user;
  context.redirect('/admin/home');
}

export async function logout(context: EinsamkeitContext): Promise<void> {
  if (!context.session) throw new Error('Precondition failed');

  context.session.user = undefined;
  addInformationFlash(context, 'またね〜');
  keepFlash(context);
  context.redirect('/');
}

export const sessionStore: stores = {
  async get(key) {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : {};
  },
  async set(key, sess, maxAge) {
    const data = JSON.stringify(sess);
    await redis.set(key, data);
    if (typeof maxAge === 'number') await redis.expire(key, maxAge);
  },
  async destroy(key) {
    await redis.del(key);
  },
};
