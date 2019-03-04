import { EinsamkeitContext, EinsamkeitMiddleware } from '../types';
import { setSuccess, renderPug, getKnex } from '../util';
import { DbObject } from '../action/types';
import { fetchHomeTimeline } from '../action/note';
import * as datefns from 'date-fns';

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
  if (!context.session) {
    await next();
    return;
  }

  if (!context.session.flash) {
    context.session.flash = {
      info: [],
      error: [],
      keep: false,
    };
  }

  await next();
  if (context.session.flash.keep) {
    context.session.flash.keep = false;
  } else {
    context.session.flash.info = [];
    context.session.flash.error = [];
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
  if (!context.session || !context.session.user) throw new Error('Precondition failed');

  const timeline = (await fetchHomeTimeline(context.session.user.id || 0, 100))
    .map((n: any) => ({
      ...n,
      created_at: datefns.format(n.created_at, 'YYYY/MM/DD HH:mm:ss'),
    }));

  setSuccess(
    context,
    200,
    renderPug('admin.pug', {
      flash: context.session.flash,
      user: context.session.user,
      csrfToken: context.csrf,
      timeline,
    }),
  );
}
