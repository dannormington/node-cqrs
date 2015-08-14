var express = require('express');
var bodyParser = require('body-parser');

//Get command classes
var RegisterAttendee = require('./commands/registerAttendee.js');
var ChangeEmail = require('./commands/changeEmail.js');
var ConfirmChangeEmail = require('./commands/confirmChangeEmail.js');

var AttendeeDataProvider = require('./infrastructure/attendeeDataProvider.js');

var messageBus = require('./infrastructure/messageBus.js').Instance;
var database = require('./infrastructure/database.js').Instance;
var server;

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

database.connect(function(err){

  if(err){
    throw err;
  }

  //Wait to register the command/event handlers once a database
  //connection has been established
  require('./handlers/attendeeCommandHandlers.js');
  require('./handlers/attendeeEventHandlers.js');

  server = app.listen(process.env.PORT || 4730);
});

/*
Perform any resource cleanup such as message bus
handlers and database connections
*/
function cleanupResources(){

  //unsubscribe the handlers
  if(messageBus){
    messageBus.unsubscribeAll();
    messageBus = null;
  }

  database.close();
}

/*
In the event of a CTRL+C or kill command
close the server gracefully
*/
function closeServer(){

  if(server){
    server.close(function() {

      console.log("Closed out remaining connections.");

      process.exit();

    });

    setTimeout(function() {
      console.error("Could not close connections in time, forcefully shutting down");
      process.exit();
    }, 10*1000);
  }else{
    process.exit();
  }

}

// listen for TERM signal .e.g. kill
process.on ('SIGTERM', closeServer);

// listen for INT signal e.g. Ctrl-C
process.on ('SIGINT', closeServer);

// listen for exit
process.on('exit', cleanupResources);


//register an attendee
app.post('/attendees/register', function(req, res){

  res.type('text/plain');

  messageBus.send(RegisterAttendee.COMMAND, req.body, function(err, exception){
    if(err){
      res.status(exception ? 500 : 400).send(err.message);
    }else{
      res.send('Attendee Registered');
    }
  });

});

//change the attendee's email
app.post('/attendees/:id/changeemail', function(req, res){

  res.type('text/plain');

  var command = req.body;
  command.id = req.params.id;

  messageBus.send(ChangeEmail.COMMAND, command, function(err, exception){
    if(err){
      res.status(exception ? 500 : 400).send(err.message);
    }else{
      res.send('Email Changed.');
    }
  });

});

//Confirm the email address
app.post('/attendees/:id/confirmchangeemail', function(req, res){

  res.type('text/plain');

  var command = req.body;
  command.id = req.params.id;

  messageBus.send(ConfirmChangeEmail.COMMAND, command, function(err, exception){
    if(err){
      res.status(exception ? 500 : 400).send(err.message);
    }else{
      res.send('Email Change Confirmed.');
    }
  });

});

app.get('/attendees/:id', function(req, res){

  res.type('application/json');

  var id = parseInt(req.params.id);
  var dataProvider = new AttendeeDataProvider();

  dataProvider.getAttendee(id, function(err, attendee){
    if(err){
      res.status(500).send(err.message);
    }else{
      res.send(attendee);
    }
  });

});

app.get('/attendees', function(req, res){

  res.type('application/json');

  var dataProvider = new AttendeeDataProvider();

  dataProvider.getAttendees(function(err, attendees){

    if(err){
      res.status(500).send(err.message);
    }else{
      res.send(attendees);
    }

  });


});
