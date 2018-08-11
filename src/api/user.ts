import * as url from 'url';
import * as config from 'config';
import { Context } from 'koa';
import { getActorById } from '../lib/user';
import { IAdminConfigObject } from '../../config/types';

const admin = config.get<IAdminConfigObject>('admin');

/**
 * Admin のプロフィールページか Activity JSON を返す
 * @param ctx context
 */
export function me(ctx: Context) {
  // TODO: Accept 無しのときはプロフィールのhtmlレスポンスをするべき
  const accepts = ctx.request.accepts(['application/activity+json', 'text/html']);
  if (accepts === 'application/activity+json') {
    ctx.status = 200;
    ctx.body = ctx.request.header.accept;
  } else {
    ctx.status = 200;
    ctx.body = 'Not Implemented';
  }
}
