/**
 * ActivityStreams の基底オブジェクト
 */
export function makeASRoot(): any {
  return {
    '@context': ['https://www.w3.org/ns/activitystreams', 'https://w3id.org/security/v1'],
  };
}

export function makeASOrderedCollection(items: any[]): any {
  return {
    ...makeASRoot(),
    type: 'OrderedCollection',
    orderedItems: items,
  };
}
