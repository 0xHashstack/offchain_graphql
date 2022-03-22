/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    await knex.schema
    .createTable('whitelist_status_lookup', table => {
        table.integer('whitelist_status_id').primary().notNullable();
        table.string('whitelist_status_description').notNullable();
    })
    .createTable('liquidation_status_lookup', table => {
        table.integer('liquidation_status_id').primary().notNullable();
        table.string('liquidation_status_description').notNullable();
    })
    .createTable('loan_status_lookup', table => {
        table.integer('loan_status_id').primary().notNullable();
        table.string('loan_status_description').notNullable();
    })
    .createTable('accounts', table => {
        table.uuid('id').primary().notNullable();
        table.string('address').notNullable().unique();
        table
        .integer('whitelist_status_id')
        .notNullable()
        .references('whitelist_status_lookup.whitelist_status_id');
        table.string('user_role');
        table.timestamp('created_at', { useTz: true });
        table.timestamp('updated_at', { useTz: true });
      })
    .createTable('withdrawals', table => {
        table.uuid('id').primary().notNullable();
        table.string('market').notNullable();
        table.string('commitment').notNullable();
        table.decimal('amount',80,30).notNullable();
        table
        .uuid('account_id')
        .notNullable()
        .references('accounts.id');
        table.timestamp('created_at', { useTz: true });
        table.timestamp('updated_at', { useTz: true });
    })
    .createTable('deposits', table => {
        table.uuid('id').primary().notNullable();
        table.string('market').notNullable();
        table.string('commitment').notNullable();
        table.decimal('net_amount',80,30).notNullable();
        table.decimal('net_accrued_yield',80,30).notNullable();
        table
        .uuid('account_id')
        .notNullable()
        .references('accounts.id');
        table.timestamp('created_at', { useTz: true });
        table.timestamp('updated_at', { useTz: true });
    })
    .createTable('loans', table => {
        table.uuid('id').primary().notNullable();
        table.string('loan_market').notNullable();
        table.decimal('loan_amount',80,30).notNullable();
        table.string('collateral_market').notNullable();
        table.decimal('collateral_amount',80,30).notNullable();
        table.string('commitment').notNullable();
        table.decimal('cdr',80,30).notNullable();
        table.integer('debt_category').notNullable();
        table.decimal('current_amount',80,30).notNullable();
        table.string('current_market').notNullable();
        table.boolean('is_swapped').notNullable();
        table
        .integer('loan_status_id')
        .notNullable()
        .references('loan_status_lookup.loan_status_id');
        table.uuid('account_id')
        .notNullable()
        .references('accounts.id');
        table.timestamp('created_at', { useTz: true });
        table.timestamp('updated_at', { useTz: true });
    })
    .createTable('liquidations', table => {
        table.uuid('id').primary().notNullable();
        table
        .integer('liquidation_status_id')
        .notNullable()
        .references('liquidation_status_lookup.liquidation_status_id');
        table.string('liquidated_by');
        table
        .uuid ('loan_id')
        .notNullable()
        .references('loans.id');
        table
        .uuid('account_id')
        .notNullable()
        .references('accounts.id');
        table.timestamp('created_at', { useTz: true });
        table.timestamp('updated_at', { useTz: true });
    })
    
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    knex.schema
    .dropTable('liquidations')
    .dropTable('loans')
    .dropTable('deposits')
    .dropTable('withdrawals')
    .dropTable('accounts')
    .dropTable('loan_status_lookup')
    .dropTable('liquidation_status_lookup')
    .dropTable('whitelist_status_lookup')
};
