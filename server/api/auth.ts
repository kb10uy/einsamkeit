import { EinsamkeitContext } from '../types';
import { setError } from '../util';

/**
 * API で認証されたユーザーのリクエストのみを通過する。
 *
 * @export
 * @param {EinsamkeitContext} context context
 * @param {() => Promise<any>} next next
 * @returns {Promise<void>}
 */
export async function authenticatedUser(context: EinsamkeitContext, next: () => Promise<any>): Promise<void> {
  if (context.session) {
    const user = context.session.user;
    if (user) {
      await next();
    } else {
      setError(context, 401, {
        error: 'Unauthorized',
      });
    }
  } else {
    // TODO: OAuth2などで通すようにする
    setError(context, 401, {
      error: 'Unauthorized',
    });
  }
}
