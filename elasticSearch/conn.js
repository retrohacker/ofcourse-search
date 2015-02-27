var elasticsearch = require('elasticsearch');
var client = module.exports = new elasticsearch.Client({
  host: process.env.ELASTICSEARCH_URL || 'localhost:9200',
  log: 'trace'
});
