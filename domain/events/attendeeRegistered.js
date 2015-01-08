var Event = require('./event.js');
var util = require("util");

util.inherits(AttendeeRegistered, Event);

AttendeeRegistered.EVENT = 'AttendeeRegistered';

function AttendeeRegistered(attendeeId, firstName, lastName, email){

  Event.call(this, AttendeeRegistered.EVENT, attendeeId);
  this.email = email;
  this.firstName = firstName;
  this.lastName = lastName;

};

module.exports = AttendeeRegistered;
