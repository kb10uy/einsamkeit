import * as config from 'config';
import * as Queue from 'bull';
import { getQueue, getLogger } from './util';
import { EinsamkeitJob } from './job/types';
import * as jobUser from './job/user';
import * as jobNote from './job/note';
import * as jobGeneral from './job/general';

const concurrency = config.get<number>('queue.concurrency');
const worker = getQueue();
const logger = getLogger();

worker.process(concurrency, async (job: Queue.Job<EinsamkeitJob>) => {
  try {
    switch (job.data.type) {
      case 'processInbox':
        await jobGeneral.processInboxActivity(job.data);
        break;

      case 'sendAccept':
        await jobUser.sendAccept(job.data);
        break;
      case 'sendUndo':
        await jobUser.sendUndo(job.data);
        break;
      case 'sendFollow':
        await jobUser.sendFollow(job.data);
        break;

      case 'receiveFollow':
        await jobUser.receiveFollow(job.data);
        break;
      case 'receiveUnfollow':
        await jobUser.receiveUnfollow(job.data);
        break;
      case 'receiveNote':
        await jobNote.receiveNote(job.data);
        break;

      case 'acceptedFollow':
        await jobUser.acceptedFollow(job.data);
        break;
    }
  } catch (e) {
    logger.error(`Exception thrown: ${e.message}`);
  }
});

logger.info(`Job worker started with ${concurrency} concurrency`);
