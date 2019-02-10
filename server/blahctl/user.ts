import * as fs from 'fs';
import { promisify } from 'util';
import * as inquirer from 'inquirer';
import chalk from 'chalk';
import { getKnex, getAPAxios, getQueue, resolveLocalUrl, getRedis } from '../util';
import { DbLocalUser, DbRemoteUser } from '../action/types';
import { fetchRemoteUser } from '../action/user';

/**
 * 新規ユーザーを追加する
 */
export async function createUser(): Promise<void> {
  const knex = getKnex();

  console.log(chalk.green('Creating a new local account.'));
  const answers: any = await inquirer.prompt([
    {
      type: 'input',
      name: 'username',
      message: 'Username',
      validate: (n: string) => (n.match(/^[a-zA-Z0-9_]{1,128}$/) ? true : 'Invalid username!'),
    },
    {
      type: 'input',
      name: 'displayName',
      message: 'Displayed Name',
      validate: (n: string) => n.length < 256,
    },
    {
      type: 'input',
      name: 'publicKeyFilename',
      message: 'Path to public key',
    },
    {
      type: 'input',
      name: 'privateKeyFilename',
      message: 'Path to private key',
    },
  ]);

  try {
    const pubkey = await promisify(fs.readFile)(answers.publicKeyFilename);
    const prvkey = await promisify(fs.readFile)(answers.privateKeyFilename);
    const now = new Date();
    await knex('users').insert({
      name: answers.username,
      display_name: answers.displayName,
      key_public: pubkey.toString(),
      key_private: prvkey.toString(),
      created_at: now,
      updated_at: now,
    });
  } catch (e) {
    console.log(chalk.red(e.message));
    process.exit(1);
  }
  process.exit(0);
}

/**
 * リモートユーザーをフォローする
 */
export async function followRemoteUser(): Promise<void> {
  const acctRegex = /^([a-zA-Z0-9_]+)@([a-zA-Z0-9\-\.]+)$/;
  const knex = getKnex();
  const apaxios = getAPAxios();
  const queue = getQueue();

  const users: Partial<DbLocalUser>[] = await knex('users').select('id', 'name', 'display_name', 'key_private');
  if (users.length === 0) process.exit(0);

  console.log(chalk.green('Follow a remote user.'));
  const { localUser, remoteUserUrl } = await inquirer.prompt([
    {
      type: 'list',
      name: 'localUser',
      message: 'Follow from...',
      choices: users.map((u) => ({
        name: `#${u.id} ${u.display_name} (@${u.name})`,
        value: u,
        short: `@${u.name}`,
      })),
    },
    {
      type: 'input',
      name: 'remoteUserUrl',
      message: 'Remote user (user@example.com)',
      validate: (n: string) => (n.match(acctRegex) ? true : 'Invalid form!'),
    },
  ]);

  console.log('Fetching remote user information...');
  const remoteUserInfo = remoteUserUrl.match(acctRegex);
  const webfingerUrl = `https://${remoteUserInfo[2]}/.well-known/webfinger?resource=acct:${remoteUserInfo[0]}`;
  let self: any;
  try {
    const wfResult = await apaxios.get(webfingerUrl);
    [self] = (wfResult.data.links as any[]).filter((u) => u.rel === 'self');
    if (!self || !self.href) throw new Error('Failed to parse Webfinger response');
  } catch (e) {
    console.log(chalk.red(`Error: ${e.message}`));
  }

  const remoteUser = await fetchRemoteUser(self.href);
  console.log(chalk.green('Remote user found!'));
  console.log(chalk.bold.white(`${remoteUser.displayName} (@${remoteUser.name}@${remoteUserInfo[2]})`));
  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: 'Are you sure?',
      default: true,
    },
  ]);
  if (!confirmed) process.exit(0);

  const now = new Date();
  const [pendingInfo] = await knex('pending_follows')
    .select()
    .where('remote_user_id', remoteUser.id)
    .where('local_user_id', localUser.id);
  if (pendingInfo) {
    console.log(chalk.green(`Follow request is already sent at ${pendingInfo.sent_at}`));
  } else {
    const [{ id, sent_at }] = await knex('pending_follows').insert(
      {
        remote_user_id: remoteUser.id,
        local_user_id: localUser.id,
        sent_at: now,
      },
      '*',
    );
    await queue.add({
      type: 'sendFollow',
      id: resolveLocalUrl(`/id/follow-requests/${id}`),
      targetInbox: remoteUser.server.sharedInbox || remoteUser.inbox,
      privateKey: {
        key: (localUser as DbLocalUser).key_private,
        id: resolveLocalUrl(`/users/${localUser.name}#publickey`),
      },
      actor: resolveLocalUrl(`/users/${localUser.name}`),
      object: remoteUser.userId,
    });
    console.log(chalk.green(`Sent follow requrest at ${sent_at.toUTCString()}`));
  }
  process.exit(0);
}

/**
 * リモートユーザーをアンフォローする
 */
export async function UnfollowRemoteUser(): Promise<void> {
  const knex = getKnex();
  const queue = getQueue();
  const redis = getRedis();

  const users: Partial<DbLocalUser>[] = await knex('users').select('id', 'name', 'display_name', 'key_private');
  if (users.length === 0) process.exit(0);

  console.log(chalk.green('Unfollow a remote user.'));
  const { localUser } = await inquirer.prompt([
    {
      type: 'list',
      name: 'localUser',
      message: 'Unollow from...',
      choices: users.map((u) => ({
        name: `#${u.id} ${u.display_name} (@${u.name})`,
        value: u,
        short: `@${u.name}`,
      })),
    },
  ]);

  const followings = await knex('remote_users')
    .select({
      id: 'remote_users.id',
      name: 'remote_users.name',
      display_name: 'remote_users.display_name',
      user_id: 'remote_users.user_id',
      domain: 'servers.domain',
      inbox: 'remote_users.inbox',
      shared_inbox: 'servers.shared_inbox',
    })
    .select(knex.raw('0 as pending'))
    .join('servers', 'servers.id', 'remote_users.server_id')
    .rightJoin('followings', 'followings.remote_user_id', 'remote_users.id')
    .where('followings.local_user_id', (localUser as DbLocalUser).id)
    .union(
      knex('remote_users')
        .select({
          id: 'remote_users.id',
          name: 'remote_users.name',
          display_name: 'remote_users.display_name',
          user_id: 'remote_users.user_id',
          domain: 'servers.domain',
          inbox: 'remote_users.inbox',
          shared_inbox: 'servers.shared_inbox',
        })
        .select(knex.raw('1 as pending'))
        .join('servers', 'servers.id', 'remote_users.server_id')
        .rightJoin('pending_follows', 'pending_follows.remote_user_id', 'remote_users.id'),
    );

  const { userToUnfollow } = await inquirer.prompt([
    {
      type: 'list',
      name: 'userToUnfollow',
      message: 'Select a user to unfollow',
      choices: followings.map((f: any) => ({
        name: `${f.pending ? '[PENDING] ' : ''}${f.display_name} (${f.name}@${f.domain})`,
        value: f,
        short: `${f.name}@${f.domain}`,
      })),
    },
  ]);
  const { confirmed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirmed',
      message: 'Are you sure?',
      default: true,
    },
  ]);
  if (!confirmed) process.exit(0);

  const me = resolveLocalUrl(`/users/${localUser.name}`);

  // 申請中かどうかで振り分け
  if (userToUnfollow.pending) {
    await knex('pending_follows')
      .where('local_user_id', localUser.id)
      .where('remote_user_id', userToUnfollow.id)
      .delete();
  } else {
    await redis.hincrby(`userstats:${localUser.id}`, 'following', -1);
    await knex('followings')
      .where('local_user_id', localUser.id)
      .where('remote_user_id', userToUnfollow.id)
      .delete();
  }

  await queue.add({
    type: 'sendUndo',
    targetInbox: userToUnfollow.shared_inbox || userToUnfollow.inbox,
    privateKey: {
      key: (localUser as DbLocalUser).key_private,
      id: resolveLocalUrl(`/users/${localUser.name}#publickey`),
    },
    actor: me,
    object: {
      type: 'Follow',
      actor: me,
      object: userToUnfollow.user_id,
    },
  });

  process.exit(0);
}

/**
 * リモートユーザーの記録を更新する
 *
 * @export
 * @returns {Promise<void>}
 */
export async function updateRemoteUser(): Promise<void> {
  const knex = getKnex();
  const apaxios = getAPAxios();

  console.log(chalk.green('Updates all known remote users.'));

  const remoteUsers: DbRemoteUser[] = await knex('remote_users').select();
  for (const remoteUser of remoteUsers) {
    const { data: userResult } = await apaxios.get(remoteUser.user_id);

    // 鍵が違っていたら乗っ取りの可能性があるのでスキップ
    if (
      userResult.publicKey &&
      userResult.publicKey.publicKeyPem &&
      userResult.publicKey.publicKeyPem !== remoteUser.key_public
    ) {
      console.log(chalk.yellow(`Remote user #${remoteUser.id} has different key from ours.`));
      continue;
    }

    const now = new Date();
    const [newUser]: [DbRemoteUser] = await knex('remote_users')
      .where('id', remoteUser.id)
      .update(
        {
          name: userResult.preferredUsername,
          display_name: userResult.name,
          icon: userResult.icon && userResult.icon.url,
          updated_at: now,
        },
        '*',
      );
    console.log(chalk.greenBright(`Updated ${remoteUser.id} (${remoteUser.user_id}).`));
  }
  process.exit(0);
}
