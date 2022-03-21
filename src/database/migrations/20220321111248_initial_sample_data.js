/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
    const timestamp = Date.now();
    
    // adding dummy data to accounts table
      await knex('accounts').insert({
        id: "f554c8f6-06e6-4386-88b9-59047adb6365",
        address: "0x0000000000000000000000DUMMY_1",
        whitelist_status_id: 2,
        user_role: "DUMMY_USER",
        created_at: new Date(),
        updated_at: new Date()
      })
      await knex('accounts').insert({
        id: "a8331bd8-fa9d-49ae-aa1e-da6734514643",
        address: "0x0000000000000000000000DUMMY_2",
        whitelist_status_id: 8,
        user_role: "DUMMY_USER",
        created_at: new Date(),
        updated_at: new Date()
      })
      await knex('accounts').insert({
        id: "f1f791d2-3f61-49cd-8013-6b94c42d3ddf",
        address: "0x0000000000000000000000DUMMY_3",
        whitelist_status_id: 2,
        user_role: "DUMMY_USER",
        created_at: new Date(),
        updated_at: new Date()
      })
      await knex('accounts').insert({
        id: "a731640c-5b22-496b-86fc-85e630b2155a",
        address: "0x0000000000000000000000DUMMY_4",
        whitelist_status_id: 2,
        user_role: "DUMMY_USER",
        created_at: new Date(),
        updated_at: new Date()
      })
      
      // adding dummy deposits
      await knex('deposits').insert({
        id: "5543ad1d-ddee-4328-b9ff-f1ce4ea9a6b3",
        account_id: "a731640c-5b22-496b-86fc-85e630b2155a",
        commitment: "0x636f6d69745f4e4f4e4500000000000000000000000000000000000000000000",
        market: "0x555344542e740000000000000000000000000000000000000000000000000000",
        net_amount: 100,
        net_accrued_yield: 0.54,
        created_at: new Date(),
        updated_at: new Date()
      })
      await knex('deposits').insert({
        id: "84cd8838-afeb-42aa-a776-b9021e6a38a4",
        account_id: "a731640c-5b22-496b-86fc-85e630b2155a",
        commitment: "0x636f6d69745f4e4f4e4500000000000000000000000000000000000000000000",
        market: "0x555344432e740000000000000000000000000000000000000000000000000000",
        net_amount: 500,
        net_accrued_yield: 0.454,
        created_at: new Date(),
        updated_at: new Date()
      })
      await knex('deposits').insert({
        id: "6ec212aa-e1dc-4c55-9a05-9f17c2e06e95",
        account_id: "a731640c-5b22-496b-86fc-85e630b2155a",
        commitment: "0x636f6d69745f54574f5745454b53000000000000000000000000000000000000",
        market: "0x555344542e740000000000000000000000000000000000000000000000000000",
        net_amount: 200,
        net_accrued_yield: 0.54,
        created_at: new Date(),
        updated_at: new Date()
      })
      await knex('deposits').insert({
        id: "16c2ec38-aa8e-4793-ba2d-0d0879cd3efa",
        account_id: "a731640c-5b22-496b-86fc-85e630b2155a",
        commitment: "0x636f6d69745f4e4f4e4500000000000000000000000000000000000000000000",
        market: "0x555344542e740000000000000000000000000000000000000000000000000000",
        net_amount: 100,
        net_accrued_yield: 0.54,
        created_at: new Date(),
        updated_at: new Date()
      })
    
      // adding loans entries
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  
};
