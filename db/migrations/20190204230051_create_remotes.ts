import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('remote_users', (table) => {
    table.increments('id');
    table.integer('server_id').notNullable();
    table
      .string('user_id', 256)
      .notNullable()
      .unique();
    table.string('name', 128).notNullable();
    table.text('display_name').notNullable();
    table.text('key_public').nullable();
    table.text('inbox').notNullable();
    table.timestamps();
  });
  await knex.schema.alterTable('servers', (table) => {
    table.text('shared_inbox');
    table.unique(['domain']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('remote_users');
  await knex.schema.alterTable('servers', (table) => {
    table.dropColumn('shared_inbox');
    table.dropUnique(['domain']);
  });
}
