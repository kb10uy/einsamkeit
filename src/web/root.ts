import { Context } from 'koa';
import { webRenderer } from '@main/singletons';

/**
 * トップページ
 * @param ctx context
 */
export function index(ctx: Context) {
  ctx.type = 'html';
  ctx.status = 200;
  ctx.body = webRenderer.render('index.pug', {});
}
