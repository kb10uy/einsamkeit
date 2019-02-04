export interface SendFollowJob {
  type: 'sendFollow';
}

export interface SendAcceptJob {
  type: 'sendAccept';
}

export type EinsamkeitJob = SendAcceptJob | SendFollowJob;
