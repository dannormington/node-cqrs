var Event = require('./event.js');
var util = require("util");

util.inherits(AttendeeEmailChanged, Event);

AttendeeEmailChanged.EVENT = 'AttendeeEmailChanged';

function AttendeeEmailChanged(confirmationId, attendeeId, email){

  Event.call(this, AttendeeEmailChanged.EVENT, attendeeId);
  this.email = email;
  this.confirmationId = confirmationId;

};

module.exports = AttendeeEmailChanged;
