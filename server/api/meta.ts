import { setSuccess } from '../util';
import { EinsamkeitContext } from '../types';

export async function hostMeta(context: EinsamkeitContext): Promise<void> {
  setSuccess(context, 200, '');
}

export async function webfinger(context: EinsamkeitContext): Promise<void> {
  setSuccess(context, 200, '');
}
