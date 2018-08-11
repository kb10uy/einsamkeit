import { parse } from 'url';
import { createSign } from 'crypto';

/**
 * ActivityPub に使うための署名を生成するクラス
 */
export default class RequestSigner {
  private keyPair: string;

  constructor(key: string) {
    this.keyPair = key;
  }

  /**
   * 現在時刻で署名を生成する。
   * @param method リクエストを飛ばすメソッド
   * @param target リクエストを飛ばすURL。こっちで domain と path に切って設定する
   */
  public makeSignature(method: string, target: string) {
    const parsedUrl = parse(target);
    if (!parsedUrl.host || !parsedUrl.path) {
      return false;
    }

    const date = new Date();
    const sign = createSign('SHA256');
    const data = `(request-target): ${method} ${parsedUrl.path}\nhost: ${parsedUrl.host}\ndate: ${date.toUTCString()}`;
    sign.write(data);
    sign.end();
    return sign.sign(this.keyPair, 'base64');
  }
}
