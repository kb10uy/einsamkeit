import * as KoaRouter from 'koa-router';

import * as apiMeta from './api/meta';
import * as apiUser from './api/user';
import * as webIndex from './web/index';
import * as webUser from './web/user';
import * as webAuth from './web/auth';
import { EinsamkeitState, EinsamkeitMiddleware } from './types';

/**
 * 全ルートを定義する
 * @param router router instance
 * @param enableSession セッションを有効にしたいルートに付ける
 */
export function defineRoutes(router: KoaRouter<EinsamkeitState>, enableSession: EinsamkeitMiddleware): void {
  router.get('/.well-known/host-meta', apiMeta.hostMeta);
  router.get('/.well-known/webfinger', apiMeta.webfinger);

  router.get('/', enableSession, webIndex.enableFlash, webIndex.index);
  router.get('/auth/login', enableSession, webIndex.enableFlash, webAuth.showLogin);
  router.post('/auth/login', enableSession, webIndex.enableFlash, webAuth.tryLogin);
  router.post('/auth/logout', enableSession, webIndex.enableFlash, webAuth.logout);
  router.get('/admin/(.*)', enableSession, webIndex.enableFlash);

  router.get('/users/:user', apiUser.checkUser, webIndex.maybeReturnHtml(webUser.user), apiUser.user);
  router.post('/users/:user/inbox', apiUser.checkUser, apiUser.inbox);
  router.get('/users/:user/outbox', apiUser.checkUser, apiUser.outbox);
  router.get('/users/:user/following', apiUser.checkUser, apiUser.following);
  router.get('/users/:user/followers', apiUser.checkUser, apiUser.followers);

  // /id/* は Activity ID 用に予約
}
