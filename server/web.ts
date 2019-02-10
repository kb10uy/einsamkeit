import * as path from 'path';
import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import * as KoaBodyParser from 'koa-bodyparser';
import * as config from 'config';
import { defineRoutes } from './routes';
import { getLogger } from './util';
import { EinsamkeitState } from './types';

const logger = getLogger();
const application = new Koa<EinsamkeitState>();
const router = new KoaRouter<EinsamkeitState>();

defineRoutes(router);

application.use(
  KoaBodyParser({
    extendTypes: {
      json: ['application/activity+json'],
    },
  }),
);
application.use(router.routes());

const port = config.get('server.port');
application.listen(port);
logger.info(`Ready (port ${port})`);
