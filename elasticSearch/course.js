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
  var search = {index:'courses',body:{query:{bool:{}}}}
  var should = search.body.query.bool.should = []
  if(opts.get('university'))
    should.push({match:{university:opts.get('university')}})
  if(opts.get('id'))
    should.push({match:{id:opts.get('id')}})
  if(opts.get('title'))
    should.push({match:{title:opts.get('title')}})
  if(opts.get('department'))
    should.push({match:{department:opts.get('department')}})
  if(opts.get('number'))
    should.push({match:{number:opts.get('number')}})
  if(opts.get('section'))
    should.push({match:{section:opts.get('section')}})
  if(opts.get('start'))
    should.push({match:{start:opts.get('start')}})
  if(opts.get('location'))
    should.push({match:{location:opts.get('location')}})
  if(opts.get('instructor'))
    should.push({match:{instructor:opts.get('instructor')}})
  if(opts.get('semester'))
    should.push({match:{semester:opts.get('semester')}})
  if(opts.get('end'))
    should.push({match:{end:opts.get('end')}})
  console.log(JSON.stringify(should))
  client.search(search,function(e,r) {
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
