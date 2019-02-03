import { knexConfigDevelopment } from './config/knex';

const env = process.env.NODE_ENV || 'development';

export = {
  'development': knexConfigDevelopment,
};
