import { getLogger } from 'log4js';
import * as config from 'config';
import * as Koa from 'koa';
import * as KoaBodyParser from 'koa-bodyparser';
import * as KoaRouter from 'koa-router';
import defineRoutes from './routes';
const serverConfig: any = config.get('server');
const logger = getLogger('Server');
logger.level = 'info';

const application = new Koa();
const router = new KoaRouter();
defineRoutes(router);

application.use(
  KoaBodyParser({
    extendTypes: {
      json: ['application/activity+json'],
    },
  }),
);
application.use(router.routes());
application.use(router.allowedMethods());
application.listen(serverConfig.listen);
logger.info(`Listen on ${serverConfig.listen}`);
