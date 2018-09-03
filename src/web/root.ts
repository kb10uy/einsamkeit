import { Context } from 'koa';
import * as Pug from 'pug';
import { pugCache } from '@main/singletons';

/**
 * トップページ
 * @param ctx context
 */
export function index(ctx: Context) {
  ctx.type = 'html';
  pugCache.render('index.pug');
}
