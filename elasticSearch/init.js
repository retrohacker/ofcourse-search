/**
 * Initialize an empty (or stale) elasticSearch instance
 */
var async = require('async')
var client = require('./conn.js')
var db = require('../pg')

module.exports = function init(cb) {
  async.waterfall([
    // First lets delete all indexes from elastic search
    function(cb) {
      client.indices.delete({index:'*'},cb)
    },
    function(resp,status,cb) {
      // Now lets get all courses so we can populate the search
      db('select * from courses',cb)
    },
    function(rows,res,cb) {
      // Now we populate the search
      var courses = []
      async.each(res.rows,
      function(v,cb) {
        client.index({index:'courses',type:'course',body:v},cb)
      },cb)
    },
    function(cb) {
      // Refresh our indexes
      client.indices.refresh({index:''},cb)
    }
  ],
  cb
)}
