var pg = module.exports = require('pg-query')
var connString = process.env.DATABASE_URL || "postgres://postgres@127.0.0.1:5432/postgres"
pg.connectionParameters = connString
pg.pg = require('pg')
pg.pg.defaults.poolSize = process.env.DATABASE_CONNS || 1
module.exports = pg
