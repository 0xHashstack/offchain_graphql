/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {

    //insert into whitelist_status_lookup table
    await knex('whitelist_status_lookup').insert({
      whitelist_status_id:2,
      whitelist_status_description:"WHITELIST_NOT_REQUESTED"
    })
    await knex('whitelist_status_lookup').insert({
      whitelist_status_id:10,
      whitelist_status_description:"WHITELIST_REQUESTED"
    })
    await knex('whitelist_status_lookup').insert({
      whitelist_status_id:18,
      whitelist_status_description:"WHITELISTED"
    })

    //insert into loan_status_lookup table
    await knex('loan_status_lookup').insert({
      loan_status_id:2,
      loan_status_description:"LOAN_CREATED",
      loan_state:"ACTIVE"
    })
    await knex('loan_status_lookup').insert({
      loan_status_id:10,
      loan_status_description:"READY_FOR_LIQUIDATION_BY_LIQUIDATOR",
      loan_state:"ACTIVE"
    })
    await knex('loan_status_lookup').insert({
      loan_status_id:18,
      loan_status_description:"PROTOCOL_TRIGGERED_LIQUIDATION_ENQUEUED",
      loan_state:"ACTIVE"
    })
    await knex('loan_status_lookup').insert({
      loan_status_id:26,
      loan_status_description:"LIQUIDATED_BY_PROTOCOL",
      loan_state:"REPAID"
    })
    await knex('loan_status_lookup').insert({
      loan_status_id:34,
      loan_status_description:"LIQUIDATED_BY_LIQUIDATOR",
      loan_state:"REPAID"
    })
    await knex('loan_status_lookup').insert({
      loan_status_id:42,
      loan_status_description:"REPAID_BY_USER",
      loan_state:"REPAID"
    })

    //insert into liquidation_status_lookup table
    await knex('liquidation_status_lookup').insert({
      liquidation_status_id:2,
      liquidation_status_description:"LIQUIDATION_ENQUEUED"
    })
    await knex('liquidation_status_lookup').insert({
      liquidation_status_id:10,
      liquidation_status_description:"LIQUIDATION_DONE"
    })

    // adding dummy data to accounts table
    await knex('accounts').insert({
      id: "f554c8f6-06e6-4386-88b9-59047adb6365",
      address: "0x0000000000000000000000DUMMY_1",
      whitelist_status_id: 2,
      user_role: "DUMMY_USER",
      created_at: new Date(),
      updated_at: new Date(),
      whitelist_requested_timestamp: new Date()
    })
    await knex('accounts').insert({
      id: "a8331bd8-fa9d-49ae-aa1e-da6734514643",
      address: "0x0000000000000000000000DUMMY_2",
      whitelist_status_id: 10,
      user_role: "DUMMY_USER",
      created_at: new Date(),
      updated_at: new Date(),
      whitelist_requested_timestamp: new Date()
    })
    await knex('accounts').insert({
      id: "f1f791d2-3f61-49cd-8013-6b94c42d3ddf",
      address: "0x0000000000000000000000DUMMY_3",
      whitelist_status_id: 2,
      user_role: "DUMMY_USER",
      created_at: new Date(),
      updated_at: new Date(),
      whitelist_requested_timestamp: new Date()
    })
    await knex('accounts').insert({
      id: "a731640c-5b22-496b-86fc-85e630b2155a",
      address: "0x0000000000000000000000DUMMY_4",
      whitelist_status_id: 2,
      user_role: "DUMMY_USER",
      created_at: new Date(),
      updated_at: new Date(),
      whitelist_requested_timestamp: new Date()
    })
    
      // adding dummy account_balance
      await knex('account_balance').insert({
        id: "5543ad1d-ddee-4328-b9ff-f1ce4ea9a6b3",
        account_id: "a731640c-5b22-496b-86fc-85e630b2155a",
        commitment: "0x636f6d69745f4e4f4e4500000000000000000000000000000000000000000000",
        market: "0x555344542e740000000000000000000000000000000000000000000000000000",
        net_balance: 100,
        net_saving_interest: 0.54,
        created_at: new Date(),
        updated_at: new Date()
      })
      await knex('account_balance').insert({
        id: "84cd8838-afeb-42aa-a776-b9021e6a38a4",
        account_id: "a731640c-5b22-496b-86fc-85e630b2155a",
        commitment: "0x636f6d69745f4e4f4e4500000000000000000000000000000000000000000000",
        market: "0x555344432e740000000000000000000000000000000000000000000000000000",
        net_balance: 500,
        net_saving_interest: 0.454,
        created_at: new Date(),
        updated_at: new Date()
      })
      await knex('account_balance').insert({
        id: "6ec212aa-e1dc-4c55-9a05-9f17c2e06e95",
        account_id: "a731640c-5b22-496b-86fc-85e630b2155a",
        commitment: "0x636f6d69745f54574f5745454b53000000000000000000000000000000000000",
        market: "0x555344542e740000000000000000000000000000000000000000000000000000",
        net_balance: 200,
        net_saving_interest: 0.54,
        created_at: new Date(),
        updated_at: new Date()
      })
      await knex('account_balance').insert({
        id: "16c2ec38-aa8e-4793-ba2d-0d0879cd3efa",
        account_id: "a731640c-5b22-496b-86fc-85e630b2155a",
        commitment: "0x636f6d69745f4e4f4e4500000000000000000000000000000000000000000000",
        market: "0x555344542e740000000000000000000000000000000000000000000000000000",
        net_balance: 100,
        net_saving_interest: 0.54,
        created_at: new Date(),
        updated_at: new Date()
      })
    
      // adding loans entries
      await knex('loans').insert({
        id: "16c2ec38-aa8e-4793-bbbb-0d0879cd3eaa",
        loan_market: "0x555344542e740000000000000000000000000000000000000000000000000000",
        loan_amount: 300000000000000000000,
        collateral_market: "0x555344542e740000000000000000000000000000000000000000000000000000",
        collateral_amount: 200000000000000000000,
        collateral_current_amount:200000000000000000002,
        borrow_interest:1.2222,
        commitment: "0x636f6d69745f4e4f4e4500000000000000000000000000000000000000000000",
        cdr: 0.66666,
        debt_category: 2,
        current_amount: 300000000000000000000,
        current_market: "0x555344542e740000000000000000000000000000000000000000000000000000",
        is_swapped: false,
        loan_status_id: 2,
        account_id: "f554c8f6-06e6-4386-88b9-59047adb6365",
        created_at: new Date(),
        updated_at: new Date()
      })

};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  
};
