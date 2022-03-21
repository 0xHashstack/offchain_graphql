require('dotenv').config({path: '../../.env'});
// Update with your config settings.

/**
 * @type { Object.<string, import("knex").Knex.Config> }
*/
module.exports = {
  development:{
    client: 'pg',
    connection: {
      host: process.env.PG_DB_HOST,
      database: process.env.PG_DB_NAME,
      user: process.env.PG_DB_USER,
      password: process.env.PG_DB_PASSWORD
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
