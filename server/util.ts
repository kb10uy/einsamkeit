import { ParameterizedContext } from 'koa';
import { EinsamkeitState } from './routes';
import * as log4js from 'log4js';
import * as config from 'config';

let logger: log4js.Logger;

/**
 * 出力可能なロガーを取得
 */
export function getLogger(): log4js.Logger {
  if (logger) return logger;
  log4js.configure(config.get('log.log4js'));
  logger = log4js.getLogger();
  logger.level = config.get('log.level');
  return logger;
}

/**
 * Koa context にレスポンスを設定する
 * @param ctx context
 * @param status status code
 * @param body body object
 */
export function setSuccess(ctx: ParameterizedContext<EinsamkeitState>, status: number, body: unknown): void {
  ctx.response.status = status;
  ctx.response.body = body;
}
