var express = require('express');
var bodyParser = require('body-parser');

//define the events to subsribe to
var AttendeeRegistered = require('./domain/events/attendeeRegistered.js');
var AttendeeEmailChanged = require('./domain/events/attendeeEmailChanged.js');
var AttendeeChangeEmailConfirmed = require('./domain/events/attendeeChangeEmailConfirmed.js');
var AttendeeConfirmChangeEmailFailed = require('./domain/events/attendeeConfirmChangeEmailFailed.js');

var AttendeeDataProvider = require('./infrastructure/attendeeDataProvider.js');

var messageBus = require('./infrastructure/messageBus.js');
var database = require('./infrastructure/database.js');
var attendeeEventHandlers;
var attendeeCommandHandlers;
var server;

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

database.connect(function(err){

  if(err){
    throw err;
  }

  attendeeCommandHandlers = require('./handlers/commands/attendeeCommandHandlers.js');
  attendeeEventHandlers = require('./handlers/events/attendeeEventHandlers.js');

  //subscribe the handlers to the domain events
  messageBus.subscribe(AttendeeRegistered.EVENT, attendeeEventHandlers.handleAttendeeRegistered);
  messageBus.subscribe(AttendeeEmailChanged.EVENT, attendeeEventHandlers.handleAttendeeEmailChanged);
  messageBus.subscribe(AttendeeChangeEmailConfirmed.EVENT, attendeeEventHandlers.handleAttendeeChangeEmailConfirmed);
  messageBus.subscribe(AttendeeConfirmChangeEmailFailed.EVENT, attendeeEventHandlers.handleAttendeeConfirmChangeEmailFailed);

  server = app.listen(process.env.PORT || 4730);
});

/*
Perform any resource cleanup such as message bus
handlers and database connections
*/
function cleanupResources(){

  //unsubscribe the handlers
  if(messageBus && attendeeEventHandlers){

    messageBus.unsubscribe(AttendeeRegistered.EVENT, attendeeEventHandlers.handleAttendeeRegistered);
    messageBus.unsubscribe(AttendeeEmailChanged.EVENT, attendeeEventHandlers.handleAttendeeEmailChanged);
    messageBus.unsubscribe(AttendeeChangeEmailConfirmed.EVENT, attendeeEventHandlers.handleAttendeeChangeEmailConfirmed);
    messageBus.unsubscribe(AttendeeConfirmChangeEmailFailed.EVENT, attendeeEventHandlers.handleAttendeeConfirmChangeEmailFailed);

    attendeeEventHandlers = null;
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

  attendeeCommandHandlers.handleRegisterAttendee(req.body, function(err, exception){
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

  attendeeCommandHandlers.handleChangeEmail(command, function(err, exception){
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

  attendeeCommandHandlers.handleConfirmChangeEmail(command, function(err, exception){
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
