import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('remote_emojis', (table) => {
    table.increments();
    table.timestamps();
    table.text('name').notNullable();
    table.text('emoji_id').unique().notNullable();
    table.text('url').notNullable();
  });
  await knex.schema.createTable('remote_notes_remote_emojis', (table) => {
    table.increments();
    table.integer('remote_note_id');
    table.integer('remote_emoji_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('remote_emojis');
  await knex.schema.dropTable('remote_notes_remote_emojis');
}
