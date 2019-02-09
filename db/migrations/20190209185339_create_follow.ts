import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('followings', (table) => {
    table.increments('id');
    table.integer('local_user_id').notNullable();
    table.integer('remote_user_id').notNullable();
    table.timestamps();
  });
  await knex.schema.createTable('followers', (table) => {
    table.increments('id');
    table.integer('local_user_id').notNullable();
    table.integer('remote_user_id').notNullable();
    table.timestamps();
  });
  await knex.schema.alterTable('users', (table) => {
    table
      .integer('following')
      .notNullable()
      .defaultTo(0);
    table
      .integer('followers')
      .notNullable()
      .defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('followings');
  await knex.schema.dropTable('followers');
}
