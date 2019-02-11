import { getQueue, getLogger } from '../util';

const queue = getQueue();
const logger = getLogger();

/**
 * Accept Activity
 * @param body
 */
export async function processAcceptActivity(body: any): Promise<void> {
  if (typeof body.object !== 'object') throw new Error('The object of Accept Activity is not an object');
  switch (body.object.type) {
    case 'Follow':
      await queue.add({
        type: 'acceptedFollow',
        actor: body.actor,
        object: body.object.actor,
      });
      break;
    default:
      logger.info(`Accept ${body.object.type} is unsupported`);
      break;
  }
}

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
    id: body.id,
  });
}

/**
 * Undo Activity
 * @param body
 */
export async function processUndoActivity(body: any): Promise<void> {
  if (typeof body.object !== 'object') throw new Error('The object of Undo Activity is not an object');
  switch (body.object.type) {
    case 'Follow':
      await queue.add({
        type: 'receiveUnfollow',
        actor: body.actor,
        target: body.object.object,
      });
      break;
    default:
      logger.info(`Undo ${body.object.type} is unsupported`);
      break;
  }
}
