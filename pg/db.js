var pg = module.exports = require('pg-query')
var connString = process.env.DATABASE_URL || "postgres://postgres@127.0.0.1:5432/postgres"
pg.connectionParameters = connString
module.exports = pg
