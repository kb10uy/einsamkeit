import { knexConfigDevelopment, knexConfigMigrations } from './config/knex';

const env = process.env.NODE_ENV || 'development';

export = {
  development: knexConfigDevelopment,
  migrations: knexConfigMigrations,
};
