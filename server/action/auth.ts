import * as _ from 'lodash';
import { createSign, createVerify } from 'crypto';
import { getLogger } from '../util';
import { fetchRemoteUserByKeyId } from './user';

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
  const dataToSign = data.join('\n');

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

/**
 * HTTP 署名を検証する。知らないユーザーだった場合ユーザーを検索しにいく。
 * @param headers 受け取ったヘッダ
 * @param requestTarget (request-target) の内容。 'post /path' など
 */
export async function verifyHttpSignature(headers: { [x: string]: string }, requestTarget: string): Promise<boolean> {
  // Signature ヘッダを分解
  const signatureHeader = headers.signature;
  const signatureProps = new Map<string, string>();
  const signatureList = signatureHeader.split(',');
  for (const sp of signatureList) {
    const match = sp.match(/([\w\-]+)="(.+)"/);
    if (!match) continue;
    signatureProps.set(match[1], match[2]);
  }

  // 署名検証するヘッダを全部取ってくる
  const h = signatureProps.get('headers');
  if (!h) {
    logger.warn('HTTP Signature without headers property');
    return false;
  }
  const headersToVerify = h.split(' ').filter((hn) => hn);
  const dataToVerify = [];
  for (const header of headersToVerify) {
    if (header === '(request-target)') {
      dataToVerify.push(`(request-target): ${requestTarget}`);
    } else {
      dataToVerify.push(`${header}: ${headers[header]}`);
    }
  }

  // 鍵を持ってくる
  const remoteUser = await fetchRemoteUserByKeyId(signatureProps.get('keyId') || '');
  if (!remoteUser || !remoteUser.key_public) return true;

  // 検証する
  const algorithm = signatureProps.get('algorithm') || 'rsa-sha256';
  const data = dataToVerify.join('\n');
  const signature = signatureProps.get('signature') || '';
  const verifier = createVerify(algorithm);
  verifier.update(data);
  const verified = verifier.verify(remoteUser.key_public, signature, 'base64');
  if (!verified) {
    logger.warn(`Failed to verify signature "${signature}"`);
  }

  return verified;
}
