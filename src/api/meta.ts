// meta.ts 非本質情報
// next: () => Promise<any>
import * as url from 'url';
import * as config from 'config';
import { Context } from 'koa';
import * as xmljs from 'xml-js';

const host: string = config.get('host');

export function returnHostMeta(ctx: Context) {
  const result: xmljs.ElementCompact = {
    _declaration: {
      _attributes: {
        version: 1.0,
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
        template: url.resolve(host, '/.well-known/webfinger?resource={uri}'),
      },
    },
  };

  ctx.body = xmljs.js2xml(result);
}
