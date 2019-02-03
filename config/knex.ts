import * as config from 'config';
import { Config, MigratorConfig, ConnectionConfig } from 'knex';

const client = 'pg';

const migrations: MigratorConfig = {
  directory: 'db/migrations',
  // @ts-ignore
  stub: 'db/template.ts',
};

const connection: ConnectionConfig = {
  host: config.get('database.host'),
  database: config.get('database.database'),
  user: config.get('database.user'),
  password: config.get('database.password'),
};

export const knexConfigDevelopment: Config = {
  client,
  connection,
  migrations,
};
