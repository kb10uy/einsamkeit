import { ParameterizedContext } from 'koa';
import * as KoaRouter from 'koa-router';

export interface EinsamkeitState {
  user: unknown;
}

export type EinsamkeitContext = ParameterizedContext<EinsamkeitState, KoaRouter.IRouterParamContext<EinsamkeitState>>;
