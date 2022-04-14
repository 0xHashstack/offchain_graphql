/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
 exports.up = async function(knex) {
    await knex.schema
    .createTable('whitelist_address', table => {
        table.uuid('id').primary().notNullable();
        table.string('address').notNullable().unique();
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    knex.schema
    .dropTable('whitelist_address')
};
