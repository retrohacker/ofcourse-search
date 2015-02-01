var ec = require('./elasticSearch')
var express = require('express')
var app = express()

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
console.log("Initializing ElasticSearch Instance...")
ec.init(function(e) {
  if(e) {
    console.log(e)
    return process.exit(1)
  }
  console.log("Done!")

  app.set('port', process.env.PORT || 5000)
  //Start Server
  app.listen(app.get('port'),function() {
    console.log("Server running on port "+app.get('port'))
  })
})
