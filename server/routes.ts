import * as KoaRouter from 'koa-router';
import * as apiMeta from './api/meta';
import { EinsamkeitState } from './types';

/**
 * 全ルートを定義する
 * @param router router instance
 */
export function defineRoutes(router: KoaRouter<EinsamkeitState>): void {
  router.get('/.well-known/host-meta', apiMeta.hostMeta);
}
