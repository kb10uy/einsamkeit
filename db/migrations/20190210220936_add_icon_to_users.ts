import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.text('icon').nullable();
  });
  await knex.schema.alterTable('remote_users', (table) => {
    table.text('icon').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('users', (table) => {
    table.dropColumn('icon');
  });
  await knex.schema.alterTable('remote_users', (table) => {
    table.dropColumn('icon');
  });
}
