import { setSuccess, getLogger, getKnex, setError, resolveLocalUrl } from '../util';
import { EinsamkeitContext } from '../types';
import { makeASRoot } from '../ap/activitystreams';

const logger = getLogger();

export async function checkUser(context: EinsamkeitContext, next: () => Promise<void>): Promise<void> {
  const knex = getKnex();
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

export async function user(context: EinsamkeitContext): Promise<void> {
  const user = context.state.user;
  if (!user) throw new Error('Precondition failed');

  setSuccess(context, 200, {
    ...makeASRoot(),
    type: 'Person',
    id: resolveLocalUrl(`/users/${user.name}`),
    inbox: resolveLocalUrl(`/users/${user.name}/inbox`),
    outbox: resolveLocalUrl(`/users/${user.name}/outbox`),
    following: resolveLocalUrl(`/users/${user.name}/following`),
    followers: resolveLocalUrl(`/users/${user.name}/followers`),
    name: user.display_name,
    preferredName: user.name,
    summary: '',
    url: resolveLocalUrl(`/users/${user.name}`),
    publicKey: {
      id: resolveLocalUrl(`/users/${user.name}#publickey`),
      owner: resolveLocalUrl(`/users/${user.name}`),
      publicKeyPem: user.key_public,
    },
  });
}

export async function inbox(context: EinsamkeitContext): Promise<void> {
  const body = context.request.body;
  logger.info(`received: ${JSON.stringify(body)}`);
  setSuccess(context, 200, {});
}

export async function outbox(context: EinsamkeitContext): Promise<void> {
  setSuccess(context, 200, {});
}
