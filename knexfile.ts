import { knexConfig, knexConfigMigrations } from './config/knex';

const env = process.env.NODE_ENV || 'development';

export = {
  [env]: knexConfig,
  migrations: knexConfigMigrations,
};
