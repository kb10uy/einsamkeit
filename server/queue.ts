import * as Queue from 'bull';
import * as config from 'config';
import { EinsamkeitJob } from './job/types';

const worker: Queue.Queue<EinsamkeitJob> = new Queue('einsamkeit-worker', {
  redis: config.get('queue.redis'),
});

worker.process(config.get('queue.concurrency'), async (job: Queue.Job<EinsamkeitJob>) => {
  switch (job.data.type) {
    case 'sendAccept':
      break;
    case 'sendFollow':
      break;
    case 'receiveFollow':
      break;
  }
});
