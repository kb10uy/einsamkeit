import * as path from 'path';
import * as Koa from 'koa';
import * as compose from 'koa-compose';
import * as KoaBodyParser from 'koa-bodyparser';
import * as KoaRouter from 'koa-router';
import * as KoaSession from 'koa-session';
import * as KoaCsrf from 'koa-csrf';
import * as KoaStatic from 'koa-static';
import * as config from 'config';
import { defineRoutes } from './routes';
import { getLogger } from './util';
import { EinsamkeitState } from './types';
import { sessionStore } from './web/auth';

const logger = getLogger();
const port = config.get('server.port');
const application = new Koa<EinsamkeitState>();
const router = new KoaRouter<EinsamkeitState>();
const enableSession = compose([
  KoaSession(
    {
      store: sessionStore,
    },
    application,
  ),
  new KoaCsrf(),
]);
const bodyparser = KoaBodyParser({
  extendTypes: {
    json: ['application/activity+json'],
  },
});
const serveStatic = KoaStatic(path.resolve(process.cwd(), 'public'), {
  gzip: true,
});

application.keys = config.get<string[]>('encryptionKeys');

defineRoutes(router, enableSession);
application.use(bodyparser);
application.use(router.routes());
application.use(serveStatic);

application.listen(port);
logger.info(`Ready (port ${port})`);
