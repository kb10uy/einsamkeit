import { ParameterizedContext } from 'koa';
import { EinsamkeitState } from './types';
import * as log4js from 'log4js';
import * as config from 'config';
import * as Knex from 'knex';

let logger: log4js.Logger;
let knex: Knex;

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
 * シングルトン knex インスタンスを取得
 */
export function getKnex(): Knex {
  if (knex) return knex;
  knex = Knex({
    client: 'pg',
    connection: {
      host: config.get('database.host'),
      database: config.get('database.database'),
      user: config.get('database.user'),
      password: config.get('database.password'),
    },
  });
  return knex;
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
