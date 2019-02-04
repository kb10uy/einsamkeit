import { ParameterizedContext } from 'koa';
import * as KoaRouter from 'koa-router';

export interface StateUser {
  id: number;
  name: string;
  display_name: string;
  key_public: string;
  key_private: string;
}

export interface EinsamkeitState {
  user?: StateUser;
}

export type EinsamkeitContext = ParameterizedContext<EinsamkeitState, KoaRouter.IRouterParamContext<EinsamkeitState>>;
