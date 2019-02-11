import * as config from 'config';
import { setSuccess, getKnex, setError, resolveLocalUrl } from '../util';
import { EinsamkeitContext } from '../types';

const server: any = config.get('server');
const httpResource = new RegExp(`${server.scheme}://${server.domain}/users/([a-zA-Z0-9_]+)`);
const acctResource = new RegExp(`acct:([a-zA-Z0-9_]+)@${server.domain}`);
const hostMetaXml = `
<?xml version="1.0"?>
<XRD xmlns="http://docs.oasis-open.org/ns/xri/xrd-1.0">
  <Link rel="lrdd" type="application/xrd+xml"
        template="${server.scheme}://${server.domain}/.well-known/webfinger?resource={uri}"
  />
</XRD>
`;

/**
 * host-meta 応答
 * @param context context
 */
export async function hostMeta(context: EinsamkeitContext): Promise<void> {
  context.response.type = 'application/xml';
  setSuccess(context, 200, hostMetaXml);
}

/**
 * webfinger 応答
 * @param context context
 */
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
      subject: `acct:${username}@${server.domain}`,
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
