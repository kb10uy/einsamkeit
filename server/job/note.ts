import { getQueue, getRedis, getKnex, getLogger } from '../util';
import { ReceiveNoteJob } from './types';
import { fetchRemoteUserByUserId } from '../action/user';
import { registerRemoteNote } from '../action/note';

const logger = getLogger();
const queue = getQueue();
const redis = getRedis();
const knex = getKnex();

/**
 * Note Object を受け取る。
 * 追加の配送もここで行う
 *
 * @export
 * @param {ReceiveNoteJob} job
 */
export async function receiveNote(job: ReceiveNoteJob): Promise<void> {
  const remoteUser = await fetchRemoteUserByUserId(job.actor);
  if (!remoteUser || !remoteUser.id) throw new Error(`Failed to fetch remote user ${job.actor}`);

  const [note] = await knex('remote_notes')
    .select('id', 'object_id')
    .where('object_id', job.object.id);
  if (note) {
    // 重複受取
  } else {
    await registerRemoteNote(job.object, remoteUser);
    const targetLocalUsers = await knex('users')
      .select('id', 'name')
      .join('followings', 'users.id', 'followings.local_user_id')
      .where('followings.remote_user_id', remoteUser.id);
    for (const user of targetLocalUsers) {
      await redis.lpush(`timeline-remote:${user.id}`, note.id);
    }
  }
}
