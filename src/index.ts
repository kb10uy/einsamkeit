import * as path from 'path';
import * as config from 'config';
import * as Koa from 'koa';
import * as KoaBodyParser from 'koa-bodyparser';
import * as KoaRouter from 'koa-router';
import * as KoaStatic from 'koa-static';
import defineRoutes from '@main/routes';
import { createLogger } from '@lib/utility';

const currentDirectory = process.cwd();
const serverConfig: any = config.get('server');
const logger = createLogger('Server');

const application = new Koa();
const router = new KoaRouter();
defineRoutes(router);

application.use(
  KoaBodyParser({
    extendTypes: {
      json: ['application/activity+json', 'application/ld+json'],
    },
  }),
);
application.use(router.routes());
application.use(router.allowedMethods());
application.use(KoaStatic(path.resolve(currentDirectory, 'dist/public')));
application.listen(serverConfig.listen);
logger.info(`Listen on ${serverConfig.listen}`);
