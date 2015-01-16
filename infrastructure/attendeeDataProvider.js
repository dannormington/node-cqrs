var database = require('./database.js');

/*
The purpose of this module is to provide
a series of methods to retieve attendee based
read models.
*/
function AttendeeDataProvider(){
  this._attendees = database.getCollection("attendee");
}

/*
Get a single attendee
*/
AttendeeDataProvider.prototype.getAttendee = function(attendeeId, callback){

  //get a single attendee and don't return the _id field from the document
  this._attendees.findOne({attendeeId:attendeeId},{_id:0}, function(err, attendee){

    if(err){
      callback(err,null);
    }else{
      callback(null, attendee);
    }

  });
};

AttendeeDataProvider.prototype.getAttendees = function(callback){

  //get all attendees and don't return the _id field from the document
  this._attendees.find({},{_id:0}).toArray(function(err, attendees){

    if(err){
      callback(err,null);
    }else{
      callback(null, attendees);
    }
  });
};

module.exports = AttendeeDataProvider;