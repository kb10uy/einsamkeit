import * as KoaRouter from 'koa-router';
import * as apiMeta from './api/meta';
import * as apiUser from './api/user';
import * as webIndex from './web/index';
import * as webUser from './web/user';
import * as webAuth from './web/auth';
import { EinsamkeitState, EinsamkeitContext } from './types';

/**
 * 全ルートを定義する
 * @param router router instance
 */
export function defineRoutes(router: KoaRouter<EinsamkeitState>): void {
  router.get('/.well-known/host-meta', disableSession, apiMeta.hostMeta);
  router.get('/.well-known/webfinger', disableSession, apiMeta.webfinger);

  router.get('/', disableSession, webIndex.index);
  router.get('/auth/login', webAuth.showLogin);
  router.post('/auth/login', webAuth.tryLogin);
  router.post('/auth/logout', webAuth.logout);

  router.get('/users/:user', disableSession, apiUser.checkUser, webIndex.maybeReturnHtml(webUser.user), apiUser.user);
  router.post('/users/:user/inbox', disableSession, apiUser.checkUser, apiUser.inbox);
  router.get('/users/:user/outbox', disableSession, apiUser.checkUser, apiUser.outbox);
  router.get('/users/:user/following', disableSession, apiUser.checkUser, apiUser.following);
  router.get('/users/:user/followers', disableSession, apiUser.checkUser, apiUser.followers);

  // /id/* は Activity ID 用に予約
}

/**
 * セッションを消す
 *
 * @param {EinsamkeitContext} context context
 * @param {() => Promise<any>} next next
 * @returns {Promise<void>}
 */
async function disableSession(context: EinsamkeitContext, next: () => Promise<any>): Promise<void> {
  if (context.session) context.session = undefined;
  await next();
}
