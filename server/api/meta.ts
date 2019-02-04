import * as config from 'config';
import { setSuccess, getKnex, setError, resolveLocalUrl } from '../util';
import { EinsamkeitContext } from '../types';

const server: any = config.get('server');
const httpResource = new RegExp(`${server.scheme}://${server.domain}/users/([a-zA-Z0-9_]+)`);
const acctResource = new RegExp(`acct:([a-zA-Z0-9_]+)@${server.domain}`);

export async function hostMeta(context: EinsamkeitContext): Promise<void> {
  setSuccess(context, 200, '');
}

export async function webfinger(context: EinsamkeitContext): Promise<void> {
  const knex = getKnex();
  const targetUri = context.request.query.resource as string;
  let match;
  let username: string;
  if ((match = httpResource.exec(targetUri)) !== null) {
    username = match[1];
  } else if ((match = acctResource.exec(targetUri)) !== null) {
    username = match[1];
  } else {
    setError(context, 404, `Invalid URI`);
    return;
  }

  const [user] = await knex('users')
    .select('id', 'name')
    .where('name', username);

  if (user) {
    setSuccess(context, 200, {
      subject: targetUri,
      links: [
        {
          rel: 'self',
          type: 'application/activity+json',
          href: resolveLocalUrl(`/users/${username}`),
        },
      ],
    });
  } else {
    setError(context, 404, `User ${username} not found`);
  }
}
