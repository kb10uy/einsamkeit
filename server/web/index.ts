import * as Pug from 'pug';
import { EinsamkeitContext, EinsamkeitMiddleware } from '../types';
import { setSuccess, pugDefaultOption } from '../util';

/**
 * Accept ヘッダで text/html が優先されていた場合、指定された Middleware にジャンプする。
 * @param jumpTo 移動先
 */
export function maybeReturnHtml(jumpTo: EinsamkeitMiddleware): EinsamkeitMiddleware {
  return async (ctx: EinsamkeitContext, next: () => Promise<any>) => {
    if (ctx.accepts('text/html') === 'text/html') {
      await jumpTo(ctx, next);
    }
  };
}

/**
 * GET /
 * @param context context
 */
export async function index(context: EinsamkeitContext): Promise<void> {
  Pug.renderFile('index.pug', {
    ...pugDefaultOption,
  });
  setSuccess(context, 200, {});
}
