import axios from 'axios';
import { URL } from 'url';
import { getKnex, getLogger } from '../util';
import { Server, DbServer, DbRemoteUser, RemoteUser } from './types';

const logger = getLogger();

/**
 * リモートのユーザーを検索する。なければ取得する
 * @param userId ユーザーを示す id プロパティ
 */
export async function fetchRemoteUser(userId: string): Promise<RemoteUser> {
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
    const userInfo = (await axios.get(userId)).data;
    dbserver = await fetchRemoteServer(userInfo);
    dbuser = (await knex('remote_users').insert(
      {
        server_id: dbserver.id,
        user_id: userId,
        name: userInfo.preferredUsername,
        display_name: userInfo.name,
        key_public: userInfo.publicKey ? userInfo.publicKey.publicKeyPem : null,
        inbox: userInfo.inbox,
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
        sharedInbox: userInfo.endpoints && userInfo.endpoints.sharedInbox ? userInfo.endpoints.sharedInbox : null,
        created_at: now,
        updated_at: now,
      },
      '*',
    ))[0];
    logger.info(`remote server ${userIdUrl.host} registered`);
  }
  return server;
}
