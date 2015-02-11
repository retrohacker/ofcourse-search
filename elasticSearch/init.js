/**
 * Initialize an empty (or stale) elasticSearch instance
 */
var async = require('async')
var client = require('./conn.js')
var db = require('../pg')
var log = require('../logger')

module.exports = function init(cb) {
  async.waterfall([
    // First lets delete all indexes from elastic search
    function(cb) {
      client.indices.delete({index:'*'},cb)
    },
    function(resp,status,cb) {
      client.indices.create({index:'courses'},cb)
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
      client.indices.refresh({index:''},function(e) {
        cb(e)
      })
    },
    function(cb) {
      //Connect the watcher to the database
      var watcher = new db.watch('elasticSearch')
      log.info("Connecting to: ",db.connectionParameters)
      watcher.connect(db.connectionParameters,function(e) {
        if(e) return cb(e)
        watcher.watch('events',['id'],function(msg) {
          // Whenever a new event is added to the database, this function will be called
          insertAssignment(msg.id)
        })
        return cb()
      })
    }
  ],
  cb
)}

function insertAssignment(id) {
  db('select * from events where id='+id+';',function(e,rows,res) {
    if(res.rows.length != 1) {
      log.error("Incorrect length of result for id "+id+": "+res.rows.length)
    }
    client.index({index:'course',type:'course',body:res.rows[0]},function(e) {
      if(e) return log.error(e)
      client.indices.refresh({index:'course'},function(e) {
        if(e) return log.error(e)
      })
    })
  })
}
