import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('pending_follows', (table) => {
    table.dropColumn('target_user');
    table.dropColumn('target_server_id');
    table.integer('remote_user_id').notNullable();
    table.renameColumn('following_user_id', 'local_user_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('pending_follows', (table) => {
    table.string('target_user', 64).notNullable();
    table.integer('target_server_id').notNullable();
    table.dropColumn('remote_user_id');
    table.renameColumn('local_user_id', 'following_user_id');
  });
}
