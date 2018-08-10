import { getLogger } from 'log4js';
import * as config from 'config';
import * as Koa from 'koa';
import * as KoaBodyParser from 'koa-bodyparser';
import * as KoaRouter from 'koa-router';
const serverConfig: any = config.get('server');
const logger = getLogger('Server');
logger.level = 'info';

const application = new Koa();
application.use(KoaBodyParser());

application.listen(serverConfig.listen);
logger.info(`Listen on ${serverConfig.listen}`);
