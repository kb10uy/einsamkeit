import * as KoaRouter from 'koa-router';

import endpoints from '@api/endpoints';
import * as apiMeta from '@api/meta';
import * as apiUser from '@api/user';

export default function defineRoutes(router: KoaRouter) {
  // .well-known
  router.get(endpoints.wellKnown.hostMeta, apiMeta.returnHostMeta);
  router.get(endpoints.wellKnown.webFinger, apiMeta.returnWebFinger);

  // user objects
  router.get(endpoints.admin.me, apiUser.me);
  router.post(endpoints.admin.inbox, apiUser.acceptInbox);
}
