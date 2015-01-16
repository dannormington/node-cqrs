var express = require('express');
var bodyParser = require('body-parser');

//define the events to subsribe to
var AttendeeRegistered = require('./domain/events/attendeeRegistered.js');
var AttendeeEmailChanged = require('./domain/events/attendeeEmailChanged.js');
var AttendeeChangeEmailConfirmed = require('./domain/events/attendeeChangeEmailConfirmed.js');
var AttendeeConfirmChangeEmailFailed = require('./domain/events/attendeeConfirmChangeEmailFailed.js');

var AttendeeDataProvider = require('./infrastructure/attendeeDataProvider.js');
var AttendeeRepository = require('./infrastructure/attendeeRepository.js');
var Attendee = require('./domain/attendee.js');

var messageBus = require('./infrastructure/messageBus.js');
var database = require('./infrastructure/database.js');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var attendeeHandler;
var server;

database.connect(function(err){

  if(err){
    throw err;
  }

  var AttendeeHandler = require('./infrastructure/attendeeHandler.js');

  //create an instance of the event handler
  attendeeHandler = new AttendeeHandler();

  //subscribe the handlers to the domain events
  messageBus.subscribe(AttendeeRegistered.EVENT, attendeeHandler.handleAttendeeRegistered);
  messageBus.subscribe(AttendeeEmailChanged.EVENT, attendeeHandler.handleAttendeeEmailChanged);
  messageBus.subscribe(AttendeeChangeEmailConfirmed.EVENT, attendeeHandler.handleAttendeeChangeEmailConfirmed);
  messageBus.subscribe(AttendeeConfirmChangeEmailFailed.EVENT, attendeeHandler.handleAttendeeConfirmChangeEmailFailed);

  server = app.listen(process.env.PORT || 4730);

});

/*
Perform any resource cleanup such as message bus
handlers and database connections
*/
function cleanupResources(){

  //unsubscribe the handlers
  if(messageBus && attendeeHandler){

    messageBus.unsubscribe(AttendeeRegistered.EVENT, attendeeHandler.handleAttendeeRegistered);
    messageBus.unsubscribe(AttendeeEmailChanged.EVENT, attendeeHandler.handleAttendeeEmailChanged);
    messageBus.unsubscribe(AttendeeChangeEmailConfirmed.EVENT, attendeeHandler.handleAttendeeChangeEmailConfirmed);
    messageBus.unsubscribe(AttendeeConfirmChangeEmailFailed.EVENT, attendeeHandler.handleAttendeeConfirmChangeEmailFailed);

    attendeeHandler = null;
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

  //validate the command
  if(!req.body.firstName || !req.body.lastName || !req.body.email || !req.body.id ||
    req.body.firstName.trim().length === 0 ||
    req.body.lastName.trim().length === 0 ||
    req.body.email.trim().length === 0){

      res.status(400).send('invalid parameters');
      return;
  }

  var id = req.body.id;
  var email = req.body.email;
  var lastName = req.body.lastName;
  var firstName = req.body.firstName;

  var attendee = new Attendee(id).init(firstName, lastName, email);

  var repository = new AttendeeRepository();

  repository.save(attendee, function(err){

    if(err){
      res.status(500).send(err.message);
    }else{
      res.send('Attendee Registered');
    }
  });
});

//change the attendee's email
app.post('/attendees/:id/changeemail', function(req, res){

  res.type('text/plain');

  //validate the command
  if(!req.body.email || req.body.email.trim().length === 0){
    res.status(400).send('invalid parameters');
    return;
  }

  var id = parseInt(req.params.id);
  var email = req.body.email;

  var repository = new AttendeeRepository();

  repository.getById(id, function(err, attendee){
    if(err){
      res.status(500).send(err.message);
    }else{

      attendee.changeEmail(email);

      repository.save(attendee, function(err){
        if(err){
          res.status(500).send(err.message);
        }else{
          res.send('email changed.');
        }
      });
    }
  });

});

//Confirm the email address
app.post('/attendees/:id/confirmchangeemail', function(req, res){

  res.type('text/plain');

  //validate the command
  if(!req.body.confirmationId || req.body.confirmationId.trim().length === 0){
    res.status(400).send('invalid parameters');
    return;
  }

  var id = parseInt(req.params.id);
  var confirmationId = req.body.confirmationId;

  var repository = new AttendeeRepository();

  repository.getById(id, function(err, attendee){
    if(err){
      res.status(500).send(err.message);
    }else{

      attendee.confirmChangeEmail(confirmationId);

      repository.save(attendee, function(err){
        if(err){
          res.status(500).send(err.message);
        }else{
          res.send('email change confirmed.');
        }
      });
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
