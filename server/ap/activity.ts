import { getQueue, getLogger } from '../util';

const queue = getQueue();
const logger = getLogger();

/**
 * Accept Activity
 * @param body
 */
export async function processAcceptActivity(body: any): Promise<void> {}

/**
 * Follow Activity
 * @param body
 */
export async function processFollowActivity(body: any): Promise<void> {
  // TODO: 現状こちらのアカウントは自動 Accept するのであとでなんとかする
  await queue.add({
    type: 'receiveFollow',
    actor: body.actor,
    target: body.object,
  });
}

/**
 * Undo Activity
 * @param body
 */
export async function processUndoActivity(body: any): Promise<void> {}
