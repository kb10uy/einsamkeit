import { setSuccess, getLogger, getKnex } from '../util';
import { EinsamkeitContext } from '../types';

const logger = getLogger();
const knex = getKnex();

export async function checkUser(context: EinsamkeitContext, next: () => Promise<void>): Promise<void> {
  const username = context.params.user;
  const user = await next();
}

export async function inbox(context: EinsamkeitContext): Promise<void> {
  const body = context.request.body;
  logger.info(`received: ${body}`);
  setSuccess(context, 200, {});
}
