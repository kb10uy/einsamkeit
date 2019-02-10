import * as Pug from 'pug';
import { EinsamkeitContext, EinsamkeitMiddleware } from '../types';
import { setSuccess, pugDefaultOption, renderPug, getKnex } from '../util';
import { DbLocalUser } from '../action/types';

const knex = getKnex();

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
  const knownUsers: DbLocalUser[] = await knex('remote_users')
    .select('name', 'display_name', 'icon', 'user_id')
    .orderBy('id', 'desc')
    .limit(10);
  setSuccess(context, 200, renderPug('index.pug', { knownUsers }));
}
