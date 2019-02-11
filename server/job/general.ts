import { ProcessInboxJob } from './types';
import { getLogger } from '../util';
import { processAcceptActivity, processFollowActivity, processUndoActivity } from '../ap/activity';

const logger = getLogger();

export async function processInboxActivity(data: ProcessInboxJob): Promise<void> {
  const { body } = data;
  switch (body.type) {
    case 'Accept':
      await processAcceptActivity(body);
      break;
    case 'Follow':
      await processFollowActivity(body);
      break;
    case 'Undo':
      await processUndoActivity(body);
      break;
  }
  logger.info(`received: ${JSON.stringify(body)}`);
}
