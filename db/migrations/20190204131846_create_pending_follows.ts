import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('pending_follows', (table) => {
    table.increments();
    table.string('target_user', 64).notNullable();
    table.integer('target_server_id').notNullable();
    table.integer('following_user_id').notNullable();
    table.timestamp('sent_at').notNullable();
  });
  await knex.schema.createTable('servers', (table) => {
    table.increments('id');
    table.string('domain', 128);
    table.string('scheme', 16);
    table.timestamps();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('pending_follows');
  await knex.schema.dropTable('servers');
}
