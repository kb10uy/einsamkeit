import * as config from 'config';
import { getLogger } from 'log4js';

const level = config.get<string>('logLevel');

/**
 * config で指定されたログレベルのロガーを作成
 * @param name カテゴリ
 */
export function createLogger(name: string) {
  const logger = getLogger(name);
  logger.level = level;
  return logger;
}
