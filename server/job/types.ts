export interface JobBase {
  type: string;
  id?: string;
}

export interface ProcessInboxJob extends JobBase {
  type: 'processInbox';
  username: string;
  headers: any;
  body: any;
}

export interface SendFollowJob extends JobBase {
  type: 'sendFollow';
}

export interface SendAcceptJob extends JobBase {
  type: 'sendAccept';
  targetInbox: string;
  privateKey: {
    key: string;
    id: string;
  };
  object: any;
  actor: any;
}

export interface ReceiveFollowJob extends JobBase {
  type: 'receiveFollow';
  target: any;
  actor: any;
}

export interface ReceiveUnfollowJob extends JobBase {
  type: 'receiveUnfollow';
  target: any;
  actor: any;
}

export type EinsamkeitJob = ProcessInboxJob | SendAcceptJob | SendFollowJob | ReceiveFollowJob | ReceiveUnfollowJob;
