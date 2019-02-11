export interface JobBase {
  type: string;
  id?: string;
}

export interface ProcessInboxJob extends JobBase {
  type: 'processInbox';
  body: any;
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

export interface SendFollowJob extends SendJob {
  type: 'sendFollow';
}

export interface SendAcceptJob extends SendJob {
  type: 'sendAccept';
}

export interface SendUndoJob extends SendJob {
  type: 'sendUndo';
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

export interface AcceptedFollowJob extends JobBase {
  type: 'acceptedFollow';
  object: any;
  actor: any;
}

export type EinsamkeitJob =
  | ProcessInboxJob
  | SendAcceptJob
  | SendFollowJob
  | SendUndoJob
  | ReceiveFollowJob
  | ReceiveUnfollowJob
  | AcceptedFollowJob;
