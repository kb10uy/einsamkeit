export interface DbObject {
  id?: number;
  created_at?: Date;
  updated_at?: Date;
  [x: string]: any;
}

export const DbKeysMergeIgnored = ['id', 'created_at', 'updated_at'];
export const DbKeysUsers = [
  'id',
  'created_at',
  'updated_at',
  'name',
  'display_name',
  'icon',
  'header',
  'password_hash',
  'key_public',
  'key_private',
];
export const DbKeysRemoteUsers = [
  'id',
  'created_at',
  'updated_at',
  'name',
  'display_name',
  'icon',
  'user_id',
  'key_public',
  'key_id',
  'inbox',
];
export const DbKeysServers = ['id', 'created_at', 'updated_at', 'scheme', 'domain', 'shared_inbox'];
export const DbKeysFollowings = ['id', 'created_at', 'updated_at', 'local_user_id', 'remote_user_id'];
export const DbKeysFollowers = ['id', 'created_at', 'updated_at', 'local_user_id', 'remote_user_id'];
export const DbKeysPendingFollows = ['id', 'created_at', 'updated_at', 'local_user_id', 'remote_user_id'];
export const DbKeysRemoteNotes = ['id', 'created_at', 'updated_at', 'object_id', 'remote_user_id', 'body_html', 'is_public'];
export const DbKeysRemoteMedia = ['id', 'created_at', 'updated_at', 'type', 'url'];
