import * as config from 'config';
import { URL } from 'url';
import { getKnex, getLogger, getAPAxios } from '../util';
import { DbObject, DbKeysUsers, DbKeysServers } from './types';

const localUserRegex = new RegExp(
  `${config.get('server.scheme')}://${config.get('server.domain')}/users/([a-zA-Z0-9_]{1,128})`,
);
const knex = getKnex();
const logger = getLogger();
const apaxios = getAPAxios();

const DbKeysServersToUsers = ['scheme', 'domain', 'shared_inbox'];

/**
 * URL がローカルユーザーかどうかを判定し、そうであればそのユーザーの情報を取得する。
 *
 * @export
 * @param {string} userId ユーザーを示す URL
 * @returns {(Promise<DbObject | undefined>)} users
 */
export async function resolveLocalUser(userId: string): Promise<DbObject | undefined> {
  const match = userId.match(localUserRegex);
  if (!match) return undefined;

  const [dbuser] = await knex('users')
    .select(DbKeysUsers)
    .where('name', match[1]);
  if (!dbuser) return undefined;
  return {
    id: dbuser.id,
    created: dbuser.created_at,
    updated: dbuser.updated_at,
    name: dbuser.name,
    displayName: dbuser.display_name,
    icon: dbuser.icon,
    publicKey: dbuser.key_public,
    privateKey: dbuser.key_private,
  };
}

/**
 * keyId プロパティからリモートユーザーを検索する。
 * 未知のユーザーならば取得する。
 *
 * @export
 * @param {string} keyId keyId
 * @returns {(Promise<RemoteUser | undefined>)} remote_users & servers
 */
export async function fetchRemoteUserByKeyId(keyId: string): Promise<DbObject | undefined> {
  let [dbData] = await knex('remote_users')
    .join('servers', 'remote_users.server_id', 'servers.id')
    .select([
      ...DbKeysUsers.map((k) => `remote_users.${k} as ${k}`),
      ...DbKeysServersToUsers.map((k) => `servers.${k} as server_${k}`),
    ])
    .where('remote_users.key_id', keyId);
  if (dbData) return dbData;

  try {
    const { data: keyData } = await apaxios.get(keyId);
    switch (keyData.type) {
      case 'Person':
        // TODO: keyId は知らないが userId は知っているという状況下で keyId を登録できない
        // とりあえず blahctl でなんとかしてもらうしかない
        return fetchRemoteUserByUserId(keyData.id);
      case 'Key':
        // Misskey などは keyId にアクセスすると本当に Key を返してくる
        return fetchRemoteUserByUserId(keyData.owner);
    }
  } catch (e) {
    logger.error(`Failed to fetch public key: ${e.message}`);
    return undefined;
  }
}

/**
 * keyId プロパティからリモートユーザーを検索する。
 * 未知のユーザーならば取得する。
 *
 * @export
 * @param {string} keyId keyId
 * @returns {(Promise<RemoteUser | undefined>)} remote_users & servers
 */
export async function fetchRemoteUserByUserId(userId: string): Promise<DbObject | undefined> {
  let [dbData] = await knex('remote_users')
    .join('servers', 'remote_users.server_id', 'servers.id')
    .select([
      ...DbKeysUsers.map((k) => `remote_users.${k} as ${k}`),
      ...DbKeysServersToUsers.map((k) => `servers.${k} as server_${k}`),
    ])
    .where('remote_users.user_id', userId);
  if (dbData) return dbData;

  try {
    const { data: userData } = await apaxios.get(userId);
    return registerRemoteUser(userData);
  } catch (e) {
    logger.error(`Failed to fetch remote user: ${e.message}`);
    return undefined;
  }
}

/**
 * リモートユーザーの情報を登録する。
 *
 * @export
 * @param {*} personData  ActivityPub Person Object
 * @returns {(Promise<DbObject | undefined>)} remote_users & servers
 */
async function registerRemoteUser(personData: any): Promise<DbObject> {
  const server = await registerRemoteServer(personData);
  const now = new Date();
  const [inserted] = await knex('remote_users').insert(
    {
      server_id: server.id,
      user_id: personData.id,
      name: personData.preferredUsername || personData.name,
      display_name: personData.name,
      key_public: personData.publicKey ? personData.publicKey.publicKeyPem : null,
      inbox: personData.inbox,
      icon: personData.icon && personData.icon.url,
      created_at: now,
      updated_at: now,
    },
    '*',
  );
  for (const key of DbKeysServersToUsers) {
    inserted[`server_${key}`] = server[key];
  }

  return inserted;
}

/**
 * リモートサーバーの情報を登録する。
 *
 * @export
 * @param {*} personData ActivityPub Person Object
 * @returns {(Promise<DbObject | undefined>)} servers
 */
async function registerRemoteServer(personData: any): Promise<DbObject> {
  const userIdUrl = new URL(personData.id);
  const [knownData] = await knex('servers')
    .select(DbKeysServers)
    .where('domain', userIdUrl.host);
  if (knownData) return knownData;

  const now = new Date();
  const sharedInbox = personData.endpoints && personData.endpoints.sharedInbox;
  const [inserted] = await knex('servers').insert(
    {
      scheme: userIdUrl.protocol,
      domain: userIdUrl.host,
      shared_inbox: sharedInbox,
      created_at: now,
      updated_at: now,
    },
    '*',
  );
  return inserted;
}
