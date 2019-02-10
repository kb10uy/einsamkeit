export interface JobBase {
  type: string;
  id?: string;
}

export interface SendJob extends JobBase {
  targetInbox: string;
  privateKey: {
    key: string;
    id: string;
  };
  actor: any;
  object: any;
}

export interface ProcessInboxJob extends JobBase {
  type: 'processInbox';
  username: string;
  headers: any;
  body: any;
}

export interface SendFollowJob extends SendJob {
  type: 'sendFollow';
}

export interface SendAcceptJob extends SendJob {
  type: 'sendAccept';
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
