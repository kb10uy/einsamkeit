import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import * as KoaBodyParser from 'koa-bodyparser';
import * as config from 'config';
import { defineRoutes } from './routes';
import { getLogger } from './util';
import { EinsamkeitState } from './types';

const logger = getLogger();
const port = config.get('server.port');
const application = new Koa<EinsamkeitState>();
const router = new KoaRouter<EinsamkeitState>();
const bodyparser = KoaBodyParser({
  extendTypes: {
    json: ['application/activity+json'],
  },
});

defineRoutes(router);

application.use(bodyparser);
application.use(router.routes());

application.listen(port);
logger.info(`Ready (port ${port})`);
