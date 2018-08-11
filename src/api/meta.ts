// meta.ts 非本質情報
// next: () => Promise<any>
import * as url from 'url';
import * as config from 'config';
import { Context } from 'koa';
import * as xmljs from 'xml-js';
import endpoints from '@api/endpoints';

const scheme: string = config.get('server.scheme');
const domain: string = config.get('server.domain');
const origin: string = `${scheme}://${domain}`;

/**
 * /.well-known/host-meta に対するレスポンス
 * @param ctx context
 */
export function returnHostMeta(ctx: Context, next: () => Promise<any>) {
  const result: xmljs.ElementCompact = {
    _declaration: {
      _attributes: {
        version: '1.0',
        encoding: 'utf-8',
      },
    },
    XRD: {
      _attributes: {
        xmlns: 'http://docs.oasis-open.org/ns/xri/xrd-1.0',
      },
      Link: {
        rel: 'lrdd',
        type: 'application/xrd+xml',
        template: url.resolve(origin, '/.well-known/webfinger?resource={uri}'),
      },
    },
  };
  ctx.body = xmljs.js2xml(result, { compact: true });
  ctx.status = 200;
  ctx.type = 'application/xml';
}

/**
 * WebFinger レスポンス
 */
export function returnWebFinger(ctx: Context, next: () => Promise<any>) {
  const subject: string = String(ctx.query.resource || '');

  const acctResult = new RegExp(`acct:([a-zA-Z0-9_]{1,64})@${domain}`).exec(subject);
  if (acctResult) {
    ctx.status = 200;
    ctx.body = makeWebFingerByUser(acctResult[1]);
    return;
  }

  const httpResult = new RegExp(`${scheme}://${domain}/([a-zA-Z0-9_]{1,64})`).exec(subject);
  if (httpResult) {
    ctx.status = 200;
    ctx.body = makeWebFingerByUser(httpResult[1]);
    return;
  }

  ctx.status = 404;
}

/**
 * WebFingerリソースを作成する
 * @param user ユーザーid(いわゆるscreenName)
 */
function makeWebFingerByUser(user: string) {
  return {
    subject: `acct:${user}@${domain}`,
    aliases: [origin],
    links: [
      {
        rel: 'self',
        type: 'application/activity+json',
        href: url.resolve(origin, endpoints.admin.me),
      },
    ],
  };
}
