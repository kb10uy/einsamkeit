import { ParameterizedContext, Middleware } from 'koa';
import * as KoaRouter from 'koa-router';
import { ContextSession } from 'koa-session';

/**
 * context.state.user
 */
export interface StateUser {
  id: number;
  name: string;
  display_name: string;
  key_public: string;
  key_private: string;
  icon: string;
}

/**
 * context.state
 */
export interface EinsamkeitState {
  user?: StateUser;
}

type EinsamkeitCustomContext = KoaRouter.IRouterParamContext<EinsamkeitState> & {
  session?: ContextSession;
};

/**
 * Einsamkeit 用の Koa.Context のエイリアス
 */
export type EinsamkeitContext = ParameterizedContext<EinsamkeitState, EinsamkeitCustomContext>;

/**
 * Einsamkeit 用の Koa.Middleware のエイリアス
 */
export type EinsamkeitMiddleware = Middleware<EinsamkeitState, EinsamkeitCustomContext>;
