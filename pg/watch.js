var m = module.exports = function pgwatch(channel) {
  var self = this
  self.channel = (channel+"").toLowerCase()
}


var pg = require('pg')
var log = require('../logger')

m.prototype.connect = function connect(connstring,cb) {
  var self = this
  pg.connect(connstring,function(e,client) {
   self.client = client
   cb(e)
  })
}

m.prototype.watch = function watch(table,columns,cb) {
  var self = this
  if(!cb) {
    cb = columns
    delete columns
  }

  self.client.on('notification',function(msg) {
    msg = msg.payload.split(',')
    var result = { table: msg[0] }
    if(columns)
      for(var i = 1; i < msg.length; i++) {
        result[columns[i-1]] = msg[i]
      }
    cb(result)
  })

  var cols = ""
  if(columns)
    for(var i=0;i<columns.length;i++) {
      cols+="|| ',' || NEW."+columns[0]
    }

  var funcName = self.channel+"_"+table+"()"
  var notification =
    "CREATE FUNCTION "+funcName+" RETURNS trigger AS $$\n"+
    "DECLARE\n" +
    "BEGIN\n" +
    "PERFORM pg_notify('"+self.channel+"', TG_TABLE_NAME "+cols+");\n" +
    "  RETURN new;\n" +
    "  END;\n" +
    "$$ LANGUAGE plpgsql;"

  log.info(notification)

  var triggerName = self.channel+"_"+table+"_trigger"
  var trigger = "CREATE TRIGGER "+triggerName+" AFTER INSERT ON events FOR EACH ROW EXECUTE PROCEDURE "+funcName+";"

  log.info(trigger)
  self.client.query("LISTEN "+self.channel,function(e) {
    if(e) return log.error(e)
    self.client.query(notification,function(e) {
      self.client.query(trigger,function(e) {
      })
    })
  })
}
