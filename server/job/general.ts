import { ProcessInboxJob } from './types';
import { verifyHttpSignature } from '../action/auth';
import { getLogger } from '../util';
import { processAcceptActivity, processFollowActivity, processUndoActivity } from '../ap/activity';

const logger = getLogger();

export async function processInboxActivity(data: ProcessInboxJob): Promise<void> {
  const { headers, body } = data;
  if (!verifyHttpSignature(headers, `/users/${data.username}/inbox`)) {
    throw new Error('Inbox aborted due to invalid HTTP signature');
  }
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
  logger.info(`received: ${JSON.stringify(headers)}`);
  logger.info(`received: ${JSON.stringify(body)}`);
}
