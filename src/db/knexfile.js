// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
*/
module.exports = {
  
  development: {
    client: 'postgresql',
    connection: {
      host: 'localhost',
      database: 'hashstack_testing',
      user:     'postgres',
      password: '2211'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      user:     'username',
      password: 'password'
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
