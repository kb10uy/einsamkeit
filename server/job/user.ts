import axios from 'axios';
import {
  ReceiveFollowJob,
  SendAcceptJob,
  ReceiveUnfollowJob,
  SendFollowJob,
  AcceptedFollowJob,
  SendUndoJob,
} from './types';
import { resolveLocalUser, fetchRemoteUserByUserId } from '../action/user';
import { getQueue, getLogger, resolveLocalUrl, getRedis, getKnex } from '../util';
import { generateHttpSignature } from '../action/auth';
import { URL } from 'url';
import { makeASRoot } from '../ap/activitystreams';

const logger = getLogger();
const queue = getQueue();
const redis = getRedis();
const knex = getKnex();

/**
 * Follow Activity の処理
 * @param data ReceiveFollowJob
 */
export async function receiveFollow(data: ReceiveFollowJob): Promise<void> {
  if (typeof data.target !== 'string') throw new Error('The target is not a string. Unsupported.');
  if (typeof data.actor !== 'string') throw new Error('The actor is not a string. Unsupported.');

  const target = await resolveLocalUser(data.target);
  if (!target) throw new Error(`User ${data.target} not found`);

  const actor = await fetchRemoteUserByUserId(data.actor);
  if (!actor) throw new Error(`User ${data.actor} not found`);

  const [follower] = await knex('followers')
    .select('id')
    .where('local_user_id', target.id || 0)
    .where('remote_user_id', actor.id || 0);
  if (follower) {
    logger.info(`Remote user #${actor.id} is already follwing local user #${target.id}`);
  } else {
    const now = new Date();
    // Redis と DB のフォロワー情報を更新
    await redis.hincrby(`userstats:${target.id}`, 'followers', 1);
    await knex('followers').insert({
      local_user_id: target.id,
      remote_user_id: actor.id,
      created_at: now,
      updated_at: now,
    });

    // 自動 Accept なので送るだけ
    const inbox = actor.server_shared_inbox || actor.inbox;
    await queue.add({
      id: '',
      type: 'sendAccept',
      targetInbox: inbox,
      privateKey: {
        key: target.key_private,
        id: resolveLocalUrl(`/users/${target.name}#publickey`),
      },
      actor: data.target,
      object: {
        type: 'Follow',
        id: data.id,
        actor: data.actor,
        object: data.target,
      },
    });
    logger.info(`Remote user #${actor.id} followed local user #${target.id}`);
  }
}

/**
 * Undo Follow Activity の処理
 * @param data ReceiveUnfollowJob
 */
export async function receiveUnfollow(data: ReceiveUnfollowJob): Promise<void> {
  if (typeof data.target !== 'string') throw new Error('The target is not a string. Unsupported.');
  if (typeof data.actor !== 'string') throw new Error('The actor is not a string. Unsupported.');

  const target = await resolveLocalUser(data.target);
  if (!target) throw new Error(`User ${data.target} not found`);

  const actor = await fetchRemoteUserByUserId(data.actor);
  if (!actor) throw new Error(`User ${data.actor} not found`);

  const [followerInfo] = await knex('followers')
    .select('id')
    .where('local_user_id', target.id || 0)
    .where('remote_user_id', actor.id || 0);
  if (!followerInfo) {
    logger.info(`Remote user #${actor.id} is not follwing local user #${target.id}`);
  } else {
    // Redis と DB のフォロワー情報を更新
    await redis.hincrby(`userstats:${target.id}`, 'followers', -1);
    await knex('followers')
      .delete()
      .where('id', followerInfo.id);
    logger.info(`Remote user #${actor.id} unfollowed local user #${target.id}`);
  }
}

/**
 * Follow Activity の送信
 * @param data SendFollowJob
 */
export async function sendFollow(data: SendFollowJob): Promise<void> {
  const inbox = new URL(data.targetInbox);
  const headers = {
    '(request-target)': `post ${inbox.pathname}`,
    host: inbox.host,
    date: new Date().toUTCString(),
  };
  const signature = generateHttpSignature(headers, data.privateKey.key, data.privateKey.id);
  await axios.post(
    data.targetInbox,
    {
      ...makeASRoot(),
      type: 'Follow',
      id: data.id,
      object: data.object,
      actor: data.actor,
    },
    {
      headers: {
        host: headers.host,
        date: headers.date,
        signature,
      },
    },
  );
  logger.info(`Sent Follow Activity to ${inbox}`);
}

/**
 * Accept Follow Activity の受信
 * @param data AcceptedFollowJob
 */
export async function acceptedFollow(data: AcceptedFollowJob): Promise<void> {
  const localUser = await resolveLocalUser(data.object);
  if (!localUser) throw new Error(`User ${data.object} not found`);

  const remoteUser = await fetchRemoteUserByUserId(data.actor);
  if (!remoteUser) throw new Error(`User ${data.actor} not found`);

  const [followingInfo] = await knex('followings')
    .select()
    .where('local_user_id', localUser.id || 0)
    .where('remote_user_id', remoteUser.id || 0);
  if (followingInfo) {
    logger.info(`Local user #${localUser.id} is already following remote user #${remoteUser.id}`);
  } else {
    // Redis と DB のフォロー情報を更新
    const now = new Date();
    await knex('followings').insert({
      local_user_id: localUser.id,
      remote_user_id: remoteUser.id,
      created_at: now,
      updated_at: now,
    });
    await knex('pending_follows')
      .where('local_user_id', localUser.id || 0)
      .where('remote_user_id', remoteUser.id || 0)
      .delete();
    await redis.hincrby(`userstats:${localUser.id}`, 'following', 1);
    logger.info(`Accepted Follow Activity ${localUser.name} -> ${remoteUser.name}@${remoteUser.server_domain}`);
  }
}

/**
 * Accept Activity の送信
 * @param data SendAcceptJob
 */
export async function sendAccept(data: SendAcceptJob): Promise<void> {
  const inbox = new URL(data.targetInbox);
  const headers = {
    '(request-target)': `post ${inbox.pathname}`,
    host: inbox.host,
    date: new Date().toUTCString(),
  };
  const signature = generateHttpSignature(headers, data.privateKey.key, data.privateKey.id);
  await axios.post(
    data.targetInbox,
    {
      ...makeASRoot(),
      type: 'Accept',
      id: data.id,
      object: data.object,
      actor: data.actor,
    },
    {
      headers: {
        host: headers.host,
        date: headers.date,
        signature,
      },
    },
  );
  logger.info(`Sent Accept Activity to ${inbox}`);
}

/**
 * Accept Activity の送信
 * @param data SendAcceptJob
 */
export async function sendUndo(data: SendUndoJob): Promise<void> {
  const inbox = new URL(data.targetInbox);
  const headers = {
    '(request-target)': `post ${inbox.pathname}`,
    host: inbox.host,
    date: new Date().toUTCString(),
  };
  const signature = generateHttpSignature(headers, data.privateKey.key, data.privateKey.id);
  await axios.post(
    data.targetInbox,
    {
      ...makeASRoot(),
      type: 'Undo',
      id: data.id,
      object: data.object,
      actor: data.actor,
    },
    {
      headers: {
        host: headers.host,
        date: headers.date,
        signature,
      },
    },
  );
  logger.info(`Sent Undo Activity to ${inbox}`);
}
