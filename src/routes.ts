import * as KoaRouter from 'koa-router';

import apiEndpoints from '@api/endpoints';
import * as apiMeta from '@api/meta';
import * as apiUser from '@api/user';

import webEndpoints from '@web/endpoints';
import * as webRoot from '@web/root';

export default function defineRoutes(router: KoaRouter) {
  // .well-known
  router.get(apiEndpoints.wellKnown.hostMeta, apiMeta.returnHostMeta);
  router.get(apiEndpoints.wellKnown.webFinger, apiMeta.returnWebFinger);

  // user objects
  router.get(apiEndpoints.admin.me, apiUser.me);
  router.post(apiEndpoints.admin.inbox, apiUser.acceptInbox);

  // web routes
  router.get(webEndpoints.index, webRoot.index);
}
