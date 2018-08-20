import * as Knex from 'knex';

export async function up(knex: Knex) {
  await knex.schema.createTable('local_users', (table) => {
    table.increments('id');
    table.string('name', 80).notNullable();
    table.string('display_name', 120).notNullable();
    table.text('description');
    table.text('icon_url');
    table.timestamps();
  });
}

export async function down(knex: Knex) {
  await knex.schema.dropTable('local_users');
}
