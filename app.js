var express = require('express');
var bodyParser = require('body-parser');

var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;

//define the events to subsribe to
var AttendeeRegistered = require('./domain/events/attendeeRegistered.js');
var AttendeeEmailChanged = require('./domain/events/attendeeEmailChanged.js');
var AttendeeChangeEmailConfirmed = require('./domain/events/attendeeChangeEmailConfirmed.js');

var DataProvider = require('./infrastructure/dataProvider.js');
var AttendeeRepository = require('./infrastructure/attendeeRepository.js');
var Attendee = require('./domain/attendee.js');
var AttendeeHandler = require('./infrastructure/attendeeHandler.js')

var messageBus = require('./infrastructure/messageBus.js');

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

var db;
var attendeeHandler;

// Initialize connection once
MongoClient.connect("mongodb://localhost:27017/nodeSimpleCQRSExample", function(err, database) {
  if(err) throw err;

  db = database;

  //create an instance of the event handler
  attendeeHandler = new AttendeeHandler(db);

  //subscribe the handlers to the domain events
  messageBus.subscribe(AttendeeRegistered.EVENT, attendeeHandler.handleAttendeeRegistered);
  messageBus.subscribe(AttendeeEmailChanged.EVENT, attendeeHandler.handleAttendeeEmailChanged);
  messageBus.subscribe(AttendeeChangeEmailConfirmed.EVENT, attendeeHandler.handleAttendeeChangeEmailConfirmed);

  app.listen(process.env.PORT || 4730);
});

app.on('close', function () {

  //unsubscribe the handlers
  messageBus.unsubscribe(AttendeeRegistered.EVENT, attendeeHandler.handleAttendeeRegistered);
  messageBus.unsubscribe(AttendeeEmailChanged.EVENT, attendeeHandler.handleAttendeeEmailChanged);
  messageBus.unsubscribe(AttendeeChangeEmailConfirmed.EVENT, attendeeHandler.handleAttendeeChangeEmailConfirmed);
});


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

  var repository = new AttendeeRepository(db);

  repository.save(attendee, function(err, result){

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

  var repository = new AttendeeRepository(db);

  repository.getById(id, function(err, attendee){
    if(err){
      res.status(500).send(err.message);
    }else{

      attendee.changeEmail(email);

      repository.save(attendee, function(err, result){
        if(err){
          res.status(500).send(err.message)
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

  var repository = new AttendeeRepository(db);

  repository.getById(id, function(err, attendee){
    if(err){
      res.status(500).send(err.message);
    }else{

      attendee.confirmChangeEmail(confirmationId);

      repository.save(attendee, function(err, result){
        if(err){
          res.status(500).send(err.message)
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
  var dataProvider = new DataProvider(db);

  dataProvider.getAttendee(id, function(err, attendee){
    res.send(attendee);
  });

});
