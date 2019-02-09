import axios from 'axios';
import { ReceiveFollowJob, SendAcceptJob } from './types';
import { resolveLocalUser, fetchRemoteUser } from '../action/user';
import { getQueue, getLogger, resolveLocalUrl, getRedis } from '../util';
import { generateHttpSignature } from '../action/auth';
import { URL } from 'url';
import { makeASRoot } from '../ap/activitystreams';

const logger = getLogger();
const queue = getQueue();
const redis = getRedis();

/**
 * Follow Activity の処理
 * @param data ReceiveFollowJob
 */
export async function receiveFollow(data: ReceiveFollowJob): Promise<void> {
  if (typeof data.target !== 'string') throw new Error('The target is not a string. Unsupported.');
  if (typeof data.actor !== 'string') throw new Error('The actor is not a string. Unsupported.');

  const target = await resolveLocalUser(data.target);
  if (!target) throw new Error(`User ${data.target} not found`);

  // 自動 Accept なので送るだけ
  const actor = await fetchRemoteUser(data.actor);
  const inbox = actor.server.sharedInbox || actor.inbox;
  await queue.add({
    id: '',
    type: 'sendAccept',
    targetInbox: inbox,
    privateKey: {
      key: target.privateKey,
      id: resolveLocalUrl(`/users/${target.name}#publickey`),
    },
    actor: data.target,
    object: {
      type: 'Follow',
      actor: data.actor,
      object: data.target,
    },
  });
}

export async function sendAccept(data: SendAcceptJob): Promise<void> {
  const inbox = new URL(data.targetInbox);
  const headers = {
    '(request-target)': `post ${inbox.pathname}`,
    host: inbox.host,
    date: new Date().toUTCString(),
  };
  const signature = generateHttpSignature(headers, data.privateKey.key, data.privateKey.id);
  const response = await axios.post(
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
        ...headers,
        signature,
      },
    },
  );
}
