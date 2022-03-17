const knex = require('knex');
const knexfile = require('./knexfile');
const db = knex(knexfile.main);
module.exports = db;
