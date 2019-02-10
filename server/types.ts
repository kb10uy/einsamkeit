import { ParameterizedContext, Middleware } from 'koa';
import * as KoaRouter from 'koa-router';

/**
 * context.state.user
 */
export interface StateUser {
  id: number;
  name: string;
  display_name: string;
  key_public: string;
  key_private: string;
}

/**
 * context.state
 */
export interface EinsamkeitState {
  user?: StateUser;
}

/**
 * Einsamkeit 用の Koa.Context のエイリアス
 */
export type EinsamkeitContext = ParameterizedContext<EinsamkeitState, KoaRouter.IRouterParamContext<EinsamkeitState>>;

/**
 * Einsamkeit 用の Koa.Middleware のエイリアス
 */
export type EinsamkeitMiddleware = Middleware<EinsamkeitState, KoaRouter.IRouterParamContext<EinsamkeitState>>;
