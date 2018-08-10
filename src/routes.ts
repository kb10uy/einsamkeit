import * as KoaRouter from 'koa-router';

import * as apiMeta from './api/meta';

export default function defineRoutes(router: KoaRouter) {
  router.get('/.well-known/host-meta', apiMeta.returnHostMeta);
}
