import { setSuccess, getLogger, getKnex, setError, resolveLocalUrl, getQueue } from '../util';
import { EinsamkeitContext } from '../types';
import { makeASRoot } from '../ap/activitystreams';

const logger = getLogger();
const queue = getQueue();

/**
 * 存在しないユーザーの場合は 404 を返す
 * @param context context
 * @param next next
 */
export async function checkUser(context: EinsamkeitContext, next: () => Promise<void>): Promise<void> {
  const knex = getKnex();
  const username = context.params.user;

  const [user] = await knex('users')
    .select('id', 'name', 'display_name', 'key_public', 'key_private', 'icon')
    .where('name', username);
  if (user) {
    context.state.user = user;
    await next();
  } else {
    setError(context, 404, `User not found: ${username}`);
  }
}

/**
 * ユーザーページ
 * @param context context
 */
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
    preferredUsername: user.name,
    summary: '',
    url: resolveLocalUrl(`/users/${user.name}`),
    publicKey: {
      id: resolveLocalUrl(`/users/${user.name}#publickey`),
      owner: resolveLocalUrl(`/users/${user.name}`),
      publicKeyPem: user.key_public,
    },
    icon: {
      type: 'Image',
      url: user.icon,
    },
  });
}

/**
 * inbox
 * @param context context
 */
export async function inbox(context: EinsamkeitContext): Promise<void> {
  const user = context.state.user;
  if (!user) throw new Error('Precondition failed');

  const body = context.request.body;
  await queue.add({
    type: 'processInbox',
    username: user.name,
    headers: context.request.headers,
    body: context.request.body,
  });
  setSuccess(context, 200, {});
}

/**
 * outbox
 * @param context context
 */
export async function outbox(context: EinsamkeitContext): Promise<void> {
  setSuccess(context, 200, {});
}

/**
 * フォロー一覧
 * @param context context
 */
export async function following(context: EinsamkeitContext): Promise<void> {
  setSuccess(context, 200, {});
}

/**
 * フォロワー一覧
 * @param context context
 */
export async function followers(context: EinsamkeitContext): Promise<void> {
  setSuccess(context, 200, {});
}
