/**
 * Initialize an empty (or stale) elasticSearch instance
 */
var async = require('async')
var client = require('./conn.js')
var db = require('../pg')
var log = require('../logger')

module.exports = function init(cb) {
  var body = []
  async.waterfall([
    // First lets delete all indexes from elastic search
    function(cb) {
      log.info('Dropping index...')
      client.indices.delete({index:'*'},cb)
    },
    function(resp,status,cb) {
      log.info('Creating index...')
      client.indices.create({index:'courses'},cb)
    },
    function(resp,status,cb) {
      log.info('Getting courses from pg...')
      // Now lets get all courses so we can populate the search
      db('select * from courses',cb)
    },
    function(rows,res,cb) {
      log.info('Creating bulk upload data structure...')
      // Now we populate the search
      var courses = []
      async.each(res.rows,
      function(v,cb) {
        body.push({index:{_index:'courses',_type:'course'}})
        body.push(v)
        cb()
      },cb)
    },
    function(cb) {
      log.info('Uploading courses to elastic search...')
      client.bulk({body:body},function(e) {
        cb(e)
      })
    },
    function(cb) {
      log.info('Refreshing elastic search indices...')
      // Refresh our indexes
      client.indices.refresh({index:''},function(e) {
        cb(e)
      })
    },
    function(cb) {
      log.info('Registering pg elasticSearch watcher...')
      //Connect the watcher to the database
      var watcher = new db.watch('elasticSearch')
      log.info("Connecting to: ",db.connectionParameters)
      watcher.connect(db.connectionParameters,function(e) {
        if(e) return cb(e)
        watcher.watch('courses',['id'],function(msg) {
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
  db('select * from courses where id='+id+';',function(e,rows,res) {
    if(res.rows.length != 1) {
      log.error("Incorrect length of result for id "+id+": "+res.rows.length)
    }
    client.index({index:'courses',type:'course',body:res.rows[0]},function(e) {
      if(e) return log.error(e)
      client.indices.refresh({index:'courses'},function(e) {
        if(e) return log.error(e)
      })
    })
  })
}
