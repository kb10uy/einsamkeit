import { ParameterizedContext } from 'koa';
import { EinsamkeitState } from '../routes';
import { setSuccess } from '../util';

export async function hostMeta(context: ParameterizedContext<EinsamkeitState>): Promise<void> {
  setSuccess(context, 200, '');
}
