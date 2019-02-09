import * as _ from 'lodash';
import { createSign } from 'crypto';
import { getLogger } from '../util';

const logger = getLogger();

/**
 * HTTP 署名を生成する。
 * @param headers 署名したいヘッダ
 * @param key 秘密鍵
 * @param keyId keyId
 */
export function generateHttpSignature(headers: { [x: string]: string }, key: string, keyId: string): string {
  const keys = Object.keys(headers);
  const data = [];
  for (const key of keys) {
    data.push(`${key}: ${headers[key]}`);
  }
  const joinedHeaders = keys.join(' ');
  const dataToSign = data.join('\x0A');

  const signer = createSign('RSA-SHA256');
  signer.update(dataToSign);
  const signature = signer.sign(key, 'base64');

  const headerData = {
    keyId,
    algorithm: 'rsa-sha256',
    headers: joinedHeaders,
    signature,
  };
  return _.map(headerData, (v, k) => `${k}="${v}"`).join(',');
}
