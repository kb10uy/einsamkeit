import * as config from 'config';
import { URL } from 'url';
import { getKnex, getLogger, getAPAxios } from '../util';
import { DbServer, DbLocalUser, DbRemoteUser, RemoteUser, LocalUser } from './types';

const localUserRegex = new RegExp(
  `${config.get('server.scheme')}://${config.get('server.domain')}/users/([a-zA-Z0-9_]{1,128})`,
);
const logger = getLogger();
const apaxios = getAPAxios();

/**
 * URL がローカルユーザーかどうかを判定し、そうであればそのユーザーの情報を取得する。
 * @param userId ユーザーを示す URL
 */
export async function resolveLocalUser(userId: string): Promise<LocalUser | undefined> {
  const match = userId.match(localUserRegex);
  if (!match) return undefined;

  const knex = getKnex();
  const [dbuser]: [DbLocalUser] = await knex('users')
    .select()
    .where('name', match[1]);
  if (!dbuser) return undefined;
  return {
    id: dbuser.id,
    created_at: dbuser.created_at,
    updated_at: dbuser.updated_at,
    name: dbuser.name,
    displayName: dbuser.display_name,
    publicKey: dbuser.key_public,
    privateKey: dbuser.key_private,
  };
}

/**
 * リモートのユーザーを検索する。なければ取得する
 * @param userId ユーザーを示す id プロパティ
 * @param recursive 再帰検索を有効にするなら true
 */
export async function fetchRemoteUser(userId: string, recursive: boolean = true): Promise<RemoteUser> {
  const knex = getKnex();
  let dbserver: DbServer;
  let dbuser: DbRemoteUser = (await knex('remote_users')
    .select()
    .where('user_id', userId))[0];
  if (dbuser) {
    dbserver = await knex('servers')
      .select()
      .where('id', dbuser.server_id);
  } else {
    const now = new Date();
    let userInfo = (await apaxios.get(userId)).data;
    if (userInfo.type !== 'Person') {
      // userId が直接 Person オブジェクトを落としてこないことがあるので
      // owner からアクセスできるか試してみる
      if (!recursive) {
        logger.warn(`Failed to fetch ${userId} (max recursive)`);
        throw new Error('Failed to fetch remote user');
      }
      return fetchRemoteUser(userInfo.owner, false);
    }
    dbserver = await fetchRemoteServer(userInfo);
    dbuser = (await knex('remote_users').insert(
      {
        server_id: dbserver.id,
        user_id: userId,
        name: userInfo.preferredUsername,
        display_name: userInfo.name,
        key_public: userInfo.publicKey ? userInfo.publicKey.publicKeyPem : null,
        inbox: userInfo.inbox,
        icon: userInfo.icon && userInfo.icon.url,
        created_at: now,
        updated_at: now,
      },
      '*',
    ))[0];
    logger.info(`remote user ${dbuser.name}@${dbserver.domain} registered`);
  }
  return {
    id: dbuser.id,
    created_at: dbuser.created_at,
    updated_at: dbuser.updated_at,
    userId: dbuser.user_id,
    name: dbuser.name,
    displayName: dbuser.display_name,
    publicKey: dbuser.key_public,
    inbox: dbuser.inbox,
    server: {
      id: dbserver.id,
      created_at: dbserver.created_at,
      updated_at: dbserver.updated_at,
      baseUrl: `${dbserver.scheme}://${dbserver.domain}/`,
      sharedInbox: dbserver.shared_inbox,
    },
  };
}

/**
 * リモートサーバーを検索する。なければ登録する
 * @param userInfo Person Object
 */
export async function fetchRemoteServer(userInfo: any): Promise<DbServer> {
  const knex = getKnex();

  const userIdUrl = new URL(userInfo.id);
  let server: DbServer = (await knex('servers')
    .select()
    .where('domain', userIdUrl.host))[0];

  if (!server) {
    const now = new Date();
    server = (await knex('servers').insert(
      {
        scheme: userIdUrl.protocol,
        domain: userIdUrl.host,
        shared_inbox: userInfo.endpoints && userInfo.endpoints.sharedInbox ? userInfo.endpoints.sharedInbox : null,
        created_at: now,
        updated_at: now,
      },
      '*',
    ))[0];
    logger.info(`remote server ${userIdUrl.host} registered`);
  }
  return server;
}
