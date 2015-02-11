var m = module.exports = {}

var models = require('../models')
var client = require('./conn.js')
var async = require('async')

/**
 *  Implement basic search
 *  opts object in the form of:
 *  {
 *    department: "cs",
 *    university: 1,
 *    number: 201,
 *     section: 1
 *  }
 *
 *  all properties optional
 */
m.search = function search(opts,cb) {
  client.search({
    index:'courses',
    body: {
      query : {
        match: {
          id: opts.get("id"),
          university: opts.get("university"),
          title: opts.get("title"),
          department: opts.get("department"),
          number: opts.get("number"),
          section: opts.get("section"),
          start: opts.get("start"),
          end: opts.get("end")
        }
      }
    }
  },function(e,r) {
    if(e) return cb(e)
    var result = []
    async.each(r.hits.hits,
      function(v,cb) {
        result.push(new models.course(v._source))
        cb()
      },
      function(e) {
        if(e) return cb(e)
        return cb(null,result)
      }
    )
  })
}
