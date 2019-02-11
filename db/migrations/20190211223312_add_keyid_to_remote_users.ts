import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('remote_users', (table) => {
    table
      .text('key_id')
      .nullable()
      .unique();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('remote_users', (table) => {
    table.dropColumn('key_id');
  });
}
