var m = module.exports = {}

var client = require('./conn.js')
var models = require('../models')

m.init = require('./init.js')

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
          department: opts.department,
          university: opts.university,
          number: opts.number,
          section: opts.section
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
