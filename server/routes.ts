import * as KoaRouter from 'koa-router';

import * as apMeta from './ap/meta';
import * as apUser from './ap/user';
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
  // .well-known routes
  router.get('/.well-known/host-meta', apMeta.hostMeta);
  router.get('/.well-known/webfinger', apMeta.webfinger);

  // ActivityPub routes
  router.get('/users/:user', apUser.checkUser, webIndex.maybeReturnHtml(webUser.user), apUser.user);
  router.post('/users/:user/inbox', apUser.checkUser, apUser.inbox);
  router.get('/users/:user/outbox', apUser.checkUser, apUser.outbox);
  router.get('/users/:user/following', apUser.checkUser, apUser.following);
  router.get('/users/:user/followers', apUser.checkUser, apUser.followers);

  // API routes

  // Web routes
  router.get('/', enableSession, webIndex.enableFlash, webIndex.index);
  router.get('/auth/login', enableSession, webIndex.enableFlash, webAuth.showLogin);
  router.post('/auth/login', enableSession, webIndex.enableFlash, webAuth.tryLogin);
  router.post('/auth/logout', enableSession, webIndex.enableFlash, webAuth.logout);
  router.get('/admin/(.*)', enableSession, webIndex.enableFlash, webIndex.admin);

  // /id/* is reserved for ids
}
