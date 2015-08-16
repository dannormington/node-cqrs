var database = require('./database.js').Instance;

/*
The purpose of this module is to provide
a series of methods to retieve and persist
attendee based read models.
*/
function AttendeeDataProvider(){
  this._attendees = database.getCollection("attendee");
}

/*
Get a single attendee
*/
AttendeeDataProvider.prototype.getAttendee = function(attendeeId, callback){

  if(!attendeeId){
    callback(new Error('attendeeId required.'));
    return;
  }

  //get a single attendee and don't return the _id field from the document
  this._attendees.findOne({attendeeId:attendeeId.trim()},{_id:0}, callback);

};

/*
Get a single attendee by email
*/
AttendeeDataProvider.prototype.getAttendeeByEmail = function(email, callback){

  if(!email){
    callback(new Error('email required.'));
    return;
  }

  //get a single attendee and don't return the _id field from the document
  this._attendees.findOne({email:email.trim().toLowerCase()},{_id:0}, callback);

};

/*
Get a list of all attendees
*/
AttendeeDataProvider.prototype.getAttendees = function(callback){

  //get all attendees and don't return the _id field from the document
  this._attendees.find({},{_id:0}).toArray(callback);

};

AttendeeDataProvider.prototype.updateAttendee = function(attendee, callback){

  if(!attendee && attendee.attendeeId){
    callback(new Error('attendee required.'));
    return;
  }

  this._attendees.update({attendeeId:attendee.attendeeId}, attendee, callback);

};

AttendeeDataProvider.prototype.insertAttendee = function(attendee, callback){

  if(!attendee){
    callback(new Error('attendee required.'));
    return;
  }

  this._attendees.insert(attendee, callback);

};

module.exports = AttendeeDataProvider;
