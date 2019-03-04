import { getLogger, getKnex } from '../util';
import { DbObject } from './types';

const knex = getKnex();
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

  const [inserted] = await knex('remote_notes').insert({
    object_id: noteObject.id,
    remote_user_id: remoteUser.id,
    body_html: noteObject.content,
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
