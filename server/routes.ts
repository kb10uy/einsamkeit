import * as KoaRouter from 'koa-router';
import * as apiMeta from './api/meta';
import * as apiUser from './api/user';
import { EinsamkeitState } from './types';

/**
 * 全ルートを定義する
 * @param router router instance
 */
export function defineRoutes(router: KoaRouter<EinsamkeitState>): void {
  router.get('/.well-known/host-meta', apiMeta.hostMeta);
  router.get('/.well-known/webfinger', apiMeta.webfinger);

  router.get('/users/:user', apiUser.checkUser, apiUser.user);
  router.post('/users/:user/inbox', apiUser.checkUser, apiUser.inbox);
  router.get('/users/:user/outbox', apiUser.checkUser, apiUser.outbox);
  router.get('/users/:user/following', apiUser.checkUser, apiUser.following);
  router.get('/users/:user/followers', apiUser.checkUser, apiUser.followers);
}
