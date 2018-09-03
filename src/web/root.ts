import { Context } from 'koa';
import { pugCache } from '@main/singletons';

/**
 * トップページ
 * @param ctx context
 */
export function index(ctx: Context) {
  ctx.type = 'html';
  ctx.status = 200;
  ctx.body = pugCache.render('index.pug', {});
}
