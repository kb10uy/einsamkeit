import * as Koa from 'koa';
import * as KoaRouter from 'koa-router';
import { defineRoutes, EinsamkeitState } from './routes';
import { getLogger } from './util';

const logger = getLogger();
const application = new Koa<EinsamkeitState>();
const router = new KoaRouter<EinsamkeitState>();

defineRoutes(router);

application.use(router.routes());

logger.info(`Ready`);
