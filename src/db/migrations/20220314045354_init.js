/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema
    .createTable('accounts', table => {
        table.uuid('id').primary().notNullable();
        table.string('address').notNullable();
        //table.enu('column', ['WHITELIST_NOT_REQUESTED', 'WHITELIST_REQUESTED', 'WHITELISTED'], { useNative: true, enumName: 'whitelist_status' });
        table.integer('whitelist_status_id');
        table.string('user_role');
        table.timestamps(true,true);
      })
    .createTable('withdrawals', table => {
        table.uuid('id').primary().notNullable();
        table.string('market').notNullable();
        table.string('commitment').notNullable();
        table.decimal('amount').notNullable();
        table
        .uuid('account_id')
        .notNullable()
        .references('accounts.id');
        table.timestamps(true,true);
    })
    .createTable('deposits', table => {
        table.uuid('id').primary().notNullable();
        table.string('market').notNullable();
        table.string('commitment').notNullable();
        table.decimal('net_amount').notNullable();
        table.decimal('net_accrued_yield').notNullable();
        table
        .uuid('account_id')
        .notNullable()
        .references('accounts.id');
        table.timestamps(true,true);
    })
    .createTable('loans', table => {
        table.uuid('id').primary().notNullable();
        table.string('loan_market').notNullable();
        table.decimal('loan_amount').notNullable();
        table.string('collateral_market').notNullable();
        table.decimal('collateral_amount').notNullable();
        table.string('commitment');
        table.decimal('cdr').notNullable();
        table.integer('debt_category');
        table.decimal('current_amount').notNullable();
        table.string('current_market').notNullable();
        table.boolean('is_swapped').notNullable();
        table.string('loan_status').notNullable();
        table.uuid('account_id')
        .notNullable()
        .references('accounts.id');
        table.timestamps(true,true);
    })
    .createTable('liquidations', table => {
        table.uuid('id').primary().notNullable();
        table.integer('liquidation_status_id').notNullable();
        table.string('liquidated_by');
        table
        .uuid ('loan_id')
        .notNullable()
        .references('loans.id');
        table
        .uuid('account_id')
        .notNullable()
        .references('accounts.id');
        table.timestamps(true,true);
    })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    knex.schema
    .dropTable('accounts')
    .dropTable('withdrawals')
    .dropTable('deposits')
    .dropTable('loans')
    .dropTable('liquidations')
};
