import { getLogger, getKnex, getRedis } from '../util';
import { DbObject } from './types';

const knex = getKnex();
const redis = getRedis();
const logger = getLogger();

/**
 * 新しく remote_notes に追加する。
 * 同じ object_id が既に存在するばあい unique 制約エラーが発生するので注意
 *
 * @export
 * @param {*} noteObject
 * @param {DbObject} remoteUser
 * @returns {Promise<DbObject>}
 */
export async function registerRemoteNote(noteObject: any, remoteUser: DbObject): Promise<DbObject> {
  // TODO: 絵文字対応
  const media = (noteObject.attachment || []).filter((att: any) => att.type === 'Document');
  const now = new Date();
  const published = new Date(noteObject.published);

  // TODO: public 判定は Note.audience も含めるべき？
  const targets = ((noteObject.to || []) as string[]).concat((noteObject.cc || []));
  const isPublic = targets.includes('https://www.w3.org/ns/activitystreams#Public') ||
    targets.includes('as:Public') ||
    targets.includes('Public') ||
    false;

  const [inserted] = await knex('remote_notes').insert({
    object_id: noteObject.id,
    remote_user_id: remoteUser.id,
    body_html: noteObject.content,
    warning_text: noteObject.summary || null,
    is_sensitive: noteObject.sensitive || false,
    is_public: isPublic,
    created_at: published,
    updated_at: now,
  }, '*');

  await knex('remote_media').insert(media.map((m: any) => ({
    type: m.mediaType,
    url: m.url,
    remote_note_id: inserted.id,
  })));

  return inserted;
}

export async function fetchHomeTimeline(localUserId: number, length: number): Promise<any[]> {
  let remoteIds = await redis.lrange(`timeline-remote:${localUserId}`, -length, -1);
  if (!remoteIds) remoteIds = await cacheHomeTimelineIds(localUserId, length);

  const userJsonAggregation = ['id', 'user_id', 'name', 'display_name', 'icon'].map((c) => `'${c}', remote_users.${c}`);
  userJsonAggregation.push('\'domain\', servers.domain');
  const remoteNotes = await knex('remote_notes')
    .join('remote_users', 'remote_notes.remote_user_id', 'remote_users.id')
    .join('servers', 'servers.id', 'remote_users.server_id')
    .leftJoin('remote_media', 'remote_notes.id', 'remote_media.remote_note_id')
    .select(
      'remote_notes.id as id',
      'remote_notes.object_id as object_id',
      'remote_notes.body_html as body_html',
      'remote_notes.created_at as created_at',
      'remote_notes.is_public as is_public',
      'remote_notes.is_sensitive as is_sensitive',
      'remote_notes.warning_text as warning_text',
      knex.raw('json_agg(remote_media.url) as media'),
      knex.raw(`json_agg(json_build_object(${userJsonAggregation.join(',')})) as user`),
    )
    .whereIn('remote_notes.id', remoteIds)
    .orderBy('remote_notes.created_at', 'desc')
    .groupBy(
      'remote_notes.id',
      'remote_notes.object_id',
      'remote_notes.body_html',
      'remote_notes.is_public',
      'remote_notes.is_sensitive',
      'remote_notes.warning_text',
    );
  // TODO: 自分の投稿をマージする

  return remoteNotes.map((n: any) => ({
    ...n,
    media: n.media.filter((m: any) => m),
    user: n.user[0],
  }));
}

/**
 * タイムラインキャッシュを構築し、その結果を返す。
 *
 * @export
 * @param {number} localUserId 構築したいユーザーの ID
 * @param {number} length 長さ
 * @returns {Promise<number[]>}
 */
export async function cacheHomeTimelineIds(localUserId: number, length: number): Promise<number[]> {
  const remoteNotes = await knex('remote_notes')
    .select('id', 'object_id')
    .whereIn(
      'remote_user_id',
      knex('followings')
        .select('remote_user_id')
        .where('local_user_id', localUserId)
    )
    .orderBy('created_at', 'desc');

  const ids = remoteNotes.map((n: any) => n.id);
  await redis.lpush(`timeline-remote:${localUserId}`, ...ids);
  return ids;
}
