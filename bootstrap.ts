import * as path from 'path';
import * as dotenv from 'dotenv';

const env = process.env.NODE_ENV || 'development';

const deResult = dotenv.config({
  path: path.resolve(process.cwd(), `.${env}.env`),
});

if (deResult.error) {
  process.exit(1);
}
