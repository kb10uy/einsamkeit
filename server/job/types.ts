export interface SendFollowJob {
  type: 'sendFollow';
}

export interface SendAcceptJob {
  type: 'sendAccept';
}

export interface ReceiveFollowJob {
  type: 'receiveFollow';
  target: any;
  actor: any;
}

export type EinsamkeitJob = SendAcceptJob | SendFollowJob | ReceiveFollowJob;
