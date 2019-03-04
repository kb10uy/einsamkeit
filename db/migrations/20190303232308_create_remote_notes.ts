import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('remote_notes', (table) => {
    table.increments();
    table.text('object_id').unique().notNullable();
    table.integer('remote_user_id').notNullable();
    table.text('body_html').notNullable();
    table.timestamps();
  });
  await knex.schema.createTable('remote_media', (table) => {
    table.increments();
    table.integer('remote_note_id').unique().notNullable();
    table.string('type', 128).nullable();
    table.text('url').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('remote_notes');
  await knex.schema.dropTable('remote_media');
}
