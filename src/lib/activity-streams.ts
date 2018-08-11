/**
 * Activity Streams 2.0 の最低限のオブジェクトを作成する。
 */
export function makeActivityStreamObject() {
  return {
    '@context': ['https://www.w3.org/ns/activitystreams', 'https://w3id.org/security/v1'],
  };
}

/**
 * Image を作成する。
 * @param name 画像の説明
 * @param url URL
 * @param sensitive 不適切フラグ
 */
export function makeImageObject(name: string, url: string, sensitive: boolean = false) {
  return {
    type: 'Image',
    name,
    url,
    sensitive: sensitive ? true : undefined,
  };
}
