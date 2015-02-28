var ec = require('./elasticSearch')
var models = require('./models')
var bodyParser = require('body-parser')
var express = require('express')
var app = express()
var log = require('./logger')

//Setup routes
app.get("/",function(req,res) {
  res.send("OK") // Lets make sure the service is still up
})

app.get("/ec",function(req,res,next) {
  ec.client.info({},function(e) {
    if(e) res.status(404).end()
    else res.send("OK")
    next()
  })
})

//Initialize database
log.info("Initializing ElasticSearch Instance...")
ec.init(function(e) {
  if(e) {
    log.error(e)
    return process.exit(1)
  }
  log.info("Done!")

  app.set('port', process.env.PORT || 5001)
  //Start Server
  app.listen(app.get('port'),function() {
    log.info("Server running on port "+app.get('port'))
  })
})

//Define routes
app.all("/course/search",function(req,res,next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Content-Type")
  next()
})
app.use("/course/search",bodyParser.json())
app.all("/course/search",function(req,res) {
  var course = new models.course()
  if(!course.set(req.body,{validate:true})) {
    return res.status(400).json({e:course.validationError})
  }
  ec.course.search(course,function(e,result) {
    if(e) return res.status(404).end()
    res.json(result)
  })
})
