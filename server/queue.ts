import * as config from 'config';
import * as Queue from 'bull';
import { EinsamkeitJob } from './job/types';
import { receiveFollow, sendAccept } from './job/user';
import { getQueue, getLogger } from './util';

const concurrency = config.get<number>('queue.concurrency');
const worker = getQueue();
const logger = getLogger();

worker.process(concurrency, async (job: Queue.Job<EinsamkeitJob>) => {
  logger.info('job processing');
  try {
    switch (job.data.type) {
      case 'sendAccept':
        await sendAccept(job.data);
        break;
      case 'sendFollow':
        break;
      case 'receiveFollow':
        await receiveFollow(job.data);
        break;
    }
  } catch (e) {
    logger.error(`Exception thrown: ${e.message}`);
  }
});

logger.info(`Job worker started with ${concurrency} concurrency`);
