var express = require('express');
var bodyParser = require('body-parser');

var DataProvider = require('./infrastructure/query/dataProvider.js');
var AttendeeRepository = require('./infrastructure/persistence/attendeeRepository.js');
var Attendee = require('./domain/attendee.js');

var app = express();

var MongoClient = require('mongodb').MongoClient;
var Server = require('mongodb').Server;
var db;

// Initialize connection once
MongoClient.connect("mongodb://localhost:27017/nodeSimpleCQRSExample", function(err, database) {
  if(err) throw err;

  db = database;

  // Start the application after the database connection is ready
  app.listen(process.env.PORT || 4730);
  console.log("app is listening");
});

app.on('close', function () {
  //perform any clean-up
  console.log("Closed");
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/attendees/register', function(req, res){

  res.type('text/plain');

  var id = req.body.id;
  var email = req.body.email;
  var lastName = req.body.lastName;
  var firstName = req.body.firstName;

  var attendee = new Attendee(id).init(firstName, lastName, email);
  var repository = new AttendeeRepository(db);

  repository.save(attendee, function(err, result){

    if(err){
      res.send(err.message);
    }else{
      res.send(result.toString());
    }
  });
});

app.post('/attendees/:id/changeemail', function(req, res){

  res.type('text/plain');

  var id = parseInt(req.params.id);
  var email = req.body.email;

  var repository = new AttendeeRepository(db);

  repository.getById(id, function(err, attendee){
    if(err){
      res.send(err.message);
    }else{
      attendee.changeEmail(email);

      repository.save(attendee, function(err, result){
        if(err){
          res.send(err.message)
        }else{
          res.send('email changed.');
        }
      });
    }
  });

});

app.post('/attendees/:id/confirmchangeemail', function(req, res){

  res.type('text/plain');

  var id = parseInt(req.params.id);
  var confirmationId = req.body.confirmationId;

  var repository = new AttendeeRepository(db);

  repository.getById(id, function(err, attendee){
    if(err){
      res.send(err.message);
    }else{

      attendee.confirmChangeEmail(confirmationId);

      repository.save(attendee, function(err, result){
        if(err){
          res.send(err.message)
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
