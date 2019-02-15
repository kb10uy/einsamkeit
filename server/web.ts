import * as path from 'path';
import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import * as KoaBodyParser from 'koa-bodyparser';
import * as KoaStatic from 'koa-static';
import * as KoaSession from 'koa-session';
import * as config from 'config';
import { defineRoutes } from './routes';
import { getLogger } from './util';
import { EinsamkeitState } from './types';

const logger = getLogger();
const port = config.get('server.port');

const application = new Koa<EinsamkeitState>();
const router = new KoaRouter<EinsamkeitState>();
const session = KoaSession({}, application);
const bodyparser = KoaBodyParser({
  extendTypes: {
    json: ['application/activity+json'],
  },
});
const serveStatic = KoaStatic(path.resolve(process.cwd(), 'public'), {
  gzip: true,
});

defineRoutes(router);
application.use(bodyparser);
application.use(session);
application.use(router.routes());
application.use(serveStatic);

application.listen(port);
logger.info(`Ready (port ${port})`);
