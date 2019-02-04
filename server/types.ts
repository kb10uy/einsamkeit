import { ParameterizedContext } from 'koa';
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
 * Einsamkeit用の Koa.Context のエイリアス
 */
export type EinsamkeitContext = ParameterizedContext<EinsamkeitState, KoaRouter.IRouterParamContext<EinsamkeitState>>;
