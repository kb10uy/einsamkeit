import * as url from 'url';
import * as config from 'config';
import { Context } from 'koa';
import { getActorById } from '../lib/user';
import { IAdminConfigObject } from '../../config/types';

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
