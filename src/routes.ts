import * as KoaRouter from 'koa-router';

import endpoints from './api/endpoints';
import * as apiMeta from './api/meta';

export default function defineRoutes(router: KoaRouter) {
  router.get(endpoints.wellKnown.hostMeta, apiMeta.returnHostMeta);
  router.get(endpoints.wellKnown.webFinger, apiMeta.returnWebFinger);
}
