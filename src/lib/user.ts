import * as url from 'url';
import * as config from 'config';
import endpoints from '../api/endpoints';

const scheme: string = config.get('server.scheme');
const domain: string = config.get('server.domain');
const origin: string = `${scheme}://${domain}`;
const admin: any = config.get('admin');

/**
 * ユーザーIDから Actor Object を取得する
 * 現在 Admin のみ
 * @param userId ユーザーID
 */
export function getActorById(userId: string) {
  if (userId !== admin.id) {
    return null;
  }
  return {
    // Required
    type: 'Person',
    id: url.resolve(origin, endpoints.admin.me),

    // Actor
    inbox: url.resolve(origin, endpoints.admin.inbox),
    outbox: url.resolve(origin, endpoints.admin.outbox),
    following: url.resolve(origin, endpoints.admin.following),
    followers: url.resolve(origin, endpoints.admin.followers),
    liked: url.resolve(origin, endpoints.admin.liked),

    // Optional
    preferredName: admin.id,
    name: admin.name,
    summary: admin.summary,
    icon: url.resolve(origin, admin.icon),
  };
}
