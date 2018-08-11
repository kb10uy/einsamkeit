import * as url from 'url';
import * as config from 'config';
import { getLogger } from 'log4js';
import { Context } from 'koa';
import { getActorById } from '../lib/user';
import { IAdminConfigObject } from '../../config/types';

const logger = getLogger('User');
logger.level = 'info';
const admin = config.get<IAdminConfigObject>('admin');

/**
 * Admin の Activity JSON を返す
 * @param ctx context
 */
export function me(ctx: Context, next: () => Promise<any>) {
  ctx.status = 200;
  ctx.type = 'application/activity+json';
  ctx.body = getActorById(admin.id);
}

/**
 * Inbox 処理のトップレベル
 * @param ctx context
 */
export function acceptInbox(ctx: Context) {
  logger.info(ctx.request.rawBody);
  ctx.status = 404;
}
