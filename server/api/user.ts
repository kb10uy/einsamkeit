import * as AS from 'activitystrea.ms';
import { setSuccess, getLogger, getKnex, setError } from '../util';
import { EinsamkeitContext } from '../types';

const logger = getLogger();
const knex = getKnex();

export async function checkUser(context: EinsamkeitContext, next: () => Promise<void>): Promise<void> {
  const username = context.params.user;
  const [user] = await knex('users')
    .select('id', 'name', 'display_name', 'key_public', 'key_private')
    .where('name', username);

  if (user) {
    context.state.user = user;
    await next();
  } else {
    setError(context, 404, `User not found: ${username}`);
  }
}

export async function inbox(context: EinsamkeitContext): Promise<void> {
  const body = context.request.body;
  logger.info(`received: ${body}`);
  setSuccess(context, 200, {});
}

export async function outbox(context: EinsamkeitContext): Promise<void> {
  setSuccess(context, 200, AS.orderedCollection());
}
