var Event = require('./event.js');
var util = require("util");

util.inherits(AttendeeChangeEmailConfirmed, Event);

AttendeeChangeEmailConfirmed.EVENT = 'AttendeeChangeEmailConfirmed';

function AttendeeChangeEmailConfirmed(attendeeId, confirmationId, email){

  Event.call(this, AttendeeChangeEmailConfirmed.EVENT, attendeeId);
  this.confirmationId = confirmationId;
  this.email = email;

}

module.exports = AttendeeChangeEmailConfirmed;
