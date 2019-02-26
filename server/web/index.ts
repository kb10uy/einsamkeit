import { EinsamkeitContext, EinsamkeitMiddleware } from '../types';
import { setSuccess, renderPug, getKnex } from '../util';
import { DbObject } from '../action/types';

const knex = getKnex();

/**
 * Accept ヘッダで text/html が優先されていた場合、指定された Middleware にジャンプする。
 * @param jumpTo 移動先
 */
export function maybeReturnHtml(jumpTo: EinsamkeitMiddleware): EinsamkeitMiddleware {
  return async (ctx: EinsamkeitContext, next: () => Promise<any>) => {
    if (ctx.accepts('text/html') === 'text/html') {
      await jumpTo(ctx, next);
    } else {
      await next();
    }
  };
}

/**
 * フラッシュデータ (次の描画で一度だけ描画されるようなステータスメッセージなど) を有効にする。
 * @param context
 */
export async function enableFlash(context: EinsamkeitContext, next: () => Promise<any>): Promise<void> {
  if (context.session) {
    if (!context.session.flash) {
      context.session.flash = {
        info: [],
        error: [],
      };
    }
    await next();
    context.session.flash.info = [];
    context.session.flash.error = [];
  } else {
    await next();
  }
}

/**
 * GET /
 * @param context context
 */
export async function index(context: EinsamkeitContext): Promise<void> {
  const knownUsers: DbObject[] = await knex('remote_users')
    .select('name', 'display_name', 'icon', 'user_id', 'servers.domain as domain')
    .join('servers', 'remote_users.server_id', 'servers.id')
    .orderBy('remote_users.id', 'desc')
    .limit(10);
  setSuccess(context, 200, renderPug('index.pug', { knownUsers }));
}

export async function admin(context: EinsamkeitContext): Promise<void> {
  if (!context.session) throw new Error('Precondition failed');
  setSuccess(context, 200, renderPug('index.pug', { flash: context.session.flash }));
}
