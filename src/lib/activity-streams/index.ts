/**
 * ActivityStreams 2.0 Core Types
 */
export type CoreType =
  | 'Object'
  | 'Link'
  | 'Activity'
  | 'IntransitiveActivity'
  | 'Collection'
  | 'OrderedCollection'
  | 'CollectionPage'
  | 'OrderedCollectionPage';

/**
 * ActivityStreams 2.0 Activity Types
 */
export type ActivityType =
  | 'Accept'
  | 'Add'
  | 'Announce'
  | 'Arrive'
  | 'Block'
  | 'Create'
  | 'Delete'
  | 'Dislike'
  | 'Flag'
  | 'Follow'
  | 'Ignore'
  | 'Invite'
  | 'Join'
  | 'Leave'
  | 'Like'
  | 'Listen'
  | 'Move'
  | 'Offer'
  | 'Question'
  | 'Reject'
  | 'Read'
  | 'Remove'
  | 'TentativeReject'
  | 'TentativeAccept'
  | 'Travel'
  | 'Undo'
  | 'Update'
  | 'View';

/**
 * ActivityStreams 2.0 Actor Types
 */
export type ActorTypes = 'Application' | 'Group' | 'Organization' | 'Person' | 'Service';

/**
 * ActivityStreams 2.0 Object and Link Types
 */
export type ObjectAndLinkTypes =
  | 'Article'
  | 'Audio'
  | 'Document'
  | 'Event'
  | 'Image'
  | 'Note'
  | 'Page'
  | 'Place'
  | 'Profile'
  | 'Relationship'
  | 'Tombstone'
  | 'Video';

/**
 * @contextが適切かどうかチェックする。
 * @param object request body
 */
export function checkContext(object: any) {
  if (!object['@context']) {
    return false;
  }
  const context = object['@context'];
  if (Array.isArray(context)) {
    return context.includes('https://www.w3.org/ns/activitystreams');
  } else {
    return context === 'https://www.w3.org/ns/activitystreams';
  }
}

/**
 * Activity Streams 2.0 の最低限のオブジェクトを作成する。
 */
export function makeObject() {
  return {
    '@context': ['https://www.w3.org/ns/activitystreams', 'https://w3id.org/security/v1'],
  };
}

/**
 * Image を作成する。
 * @param name 画像の説明
 * @param url URL
 * @param sensitive 不適切フラグ
 */
export function makeImageObject(name: string, url: string, sensitive: boolean = false) {
  return {
    type: 'Image',
    name,
    url,
    sensitive: sensitive ? true : undefined,
  };
}
