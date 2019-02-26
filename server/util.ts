import { URL } from 'url';
import * as path from 'path';
import { ParameterizedContext } from 'koa';
import { EinsamkeitState, EinsamkeitContext } from './types';
import * as log4js from 'log4js';
import * as config from 'config';
import * as Knex from 'knex';
import * as Queue from 'bull';

import { EinsamkeitJob } from './job/types';
import * as Redis from 'ioredis';
import axios, { AxiosInstance } from 'axios';
import { Options, renderFile } from 'pug';

const server = config.get<any>('server');
const urlRoot = new URL(`${server.scheme}://${server.domain}/`);
const pugRoot = path.resolve(process.cwd(), 'client/templates/');
let logger: log4js.Logger;
let knex: Knex;
let queue: Queue.Queue<EinsamkeitJob>;
let redis: Redis.Redis;
let axiosActivityPub: AxiosInstance;

/**
 * Pug のオプション
 */
export const pugDefaultOption: Options = {
  cache: false,
  pretty: true,
};

/**
 * Pug ファイルを描画する
 * @param {string} relp pug ファイルのパス
 * @param {*} local データ
 */
export function renderPug(relp: string, local?: any): string {
  return renderFile(path.resolve(pugRoot, relp), { ...pugDefaultOption, ...local });
}

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
 * 投げる用の Queue を取得
 */
export function getQueue(): Queue.Queue<EinsamkeitJob> {
  if (queue) return queue;
  queue = new Queue('einsamkeit-worker', {
    redis: config.get('queue.redis'),
  });
  return queue;
}

/**
 * ジョブキュー以外のデータのための Redis を取得
 */
export function getRedis(): Redis.Redis {
  if (redis) return redis;
  redis = new Redis(config.get('redis'));
  return redis;
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
 * ActivityPub 用の axios インスタンス を取得
 */
export function getAPAxios(): AxiosInstance {
  if (axiosActivityPub) return axiosActivityPub;
  axiosActivityPub = axios.create();
  axiosActivityPub.interceptors.request.use((config) => {
    config.headers.Accept = 'application/activity+json,application/ld+json,application/json';
    return config;
  });
  axiosActivityPub.interceptors.response.use((response) => {
    const type: string = response.headers['content-type'] || 'text/html';
    if (type.match(/application\/(\w+\+)?json/)) {
      return response;
    } else {
      throw new Error(`Response is not JSON: ${type} returned`);
    }
  });
  return axiosActivityPub;
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

/**
 * Koa context にレスポンスを設定する
 * @param ctx context
 * @param status status code
 * @param body body object
 */
export function setError(ctx: ParameterizedContext<EinsamkeitState>, status: number, body: unknown): void {
  ctx.response.status = status;
  ctx.response.body = body;
}

/**
 * 現在のセッションに通常のフラッシュデータを追加する
 * @param ctx context
 * @param message 表示したいメッセージ
 */
export function addInformationFlash(ctx: EinsamkeitContext, message: string): void {
  if (!ctx.session || !ctx.session.flash) return;
  ctx.session.flash.info.push(message);
}

/**
 * 現在のセッションにエラーのフラッシュデータを追加する
 * @param ctx context
 * @param message 表示したいメッセージ
 */
export function addErrorFlash(ctx: EinsamkeitContext, message: string): void {
  if (!ctx.session || !ctx.session.flash) return;
  ctx.session.flash.error.push(message);
}

/**
 * 現在のフラッシュデータを次回のアクセスに持ち越す
 * @param ctx context
 */
export function keepFlash(ctx: EinsamkeitContext): void {
  if (!ctx.session || !ctx.session.flash) return;
  ctx.session.flash.keep = true;
}

/**
 * このサーバーのフルURLを生成する
 * @param path パス
 */
export function resolveLocalUrl(path: string): string {
  return new URL(path, urlRoot).toString();
}
